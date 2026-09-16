package com.hirehub.hirehub_backend.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Slf4j
@Service
public class PdfTextExtractorService {

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    private static final int MAX_TEXT_LENGTH = 25000;
    private static final byte[] PDF_MAGIC_BYTES = "%PDF-".getBytes(StandardCharsets.US_ASCII);

    /**
     * Extracts and sanitizes plain text from a MultipartFile PDF.
     */
    public String extractTextFromMultipart(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("PDF file cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("PDF file exceeds maximum limit of 10MB");
        }

        try {
            byte[] bytes = file.getBytes();
            validatePdfBytes(bytes);
            return extractTextFromBytes(bytes);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to extract text from uploaded PDF file: {}", e.getMessage(), e);
            throw new RuntimeException("Could not extract readable text from PDF: " + e.getMessage());
        }
    }

    /**
     * Extracts and sanitizes plain text from raw PDF bytes.
     */
    public String extractTextFromBytes(byte[] pdfBytes) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new IllegalArgumentException("PDF byte array cannot be empty");
        }

        validatePdfBytes(pdfBytes);

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            if (document.isEncrypted()) {
                throw new IllegalArgumentException("Password protected / encrypted PDFs cannot be parsed");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String rawText = stripper.getText(document);
            return sanitizeExtractedText(rawText);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error during PDFBox text stripping: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to parse PDF document text: " + e.getMessage());
        }
    }

    /**
     * Downloads PDF from remote file URL (e.g. Supabase Storage) and extracts plain text.
     */
    public String extractTextFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new IllegalArgumentException("File URL cannot be blank");
        }

        try {
            URI uri = URI.create(fileUrl);
            URL url = uri.toURL();
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(8000);
            connection.setReadTimeout(12000);
            connection.setRequestMethod("GET");

            try (InputStream in = connection.getInputStream()) {
                byte[] bytes = in.readAllBytes();
                return extractTextFromBytes(bytes);
            }
        } catch (Exception e) {
            log.warn("Failed to download or parse PDF from URL {}: {}", fileUrl, e.getMessage());
            throw new RuntimeException("Could not extract text from resume URL: " + e.getMessage());
        }
    }

    /**
     * Validates PDF magic header bytes (%PDF-).
     */
    public void validatePdfBytes(byte[] bytes) {
        if (bytes.length < 5) {
            throw new IllegalArgumentException("File is too small to be a valid PDF");
        }
        byte[] header = Arrays.copyOfRange(bytes, 0, 5);
        if (!Arrays.equals(header, PDF_MAGIC_BYTES)) {
            throw new IllegalArgumentException("Invalid file format. File does not contain standard PDF header (%PDF-)");
        }
    }

    /**
     * Sanitizes extracted text: removes null characters, control noise, trims, and truncates safely.
     */
    public String sanitizeExtractedText(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        // Strip non-printable control characters except standard whitespace (newlines, tabs)
        String cleaned = text.replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "")
                .replaceAll("\\r\\n", "\n")
                .replaceAll("[ \\t]+", " ")
                .trim();

        if (cleaned.length() > MAX_TEXT_LENGTH) {
            cleaned = cleaned.substring(0, MAX_TEXT_LENGTH) + "\n...[truncated for analysis]";
        }

        return cleaned;
    }
}
