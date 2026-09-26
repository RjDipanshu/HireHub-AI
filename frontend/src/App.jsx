import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import AppRouter from "./routes/AppRouter";
import { ErrorBoundary } from "./components/common";

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <LanguageProvider>
                    <AuthProvider>
                        <AppRouter />
                    </AuthProvider>
                </LanguageProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
