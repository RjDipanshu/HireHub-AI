package com.hirehub.hirehub_backend.jobaggregation.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Parameters passed to JobSourceClient implementations.
 */
public class JobSearchCriteria {

    private String keyword = "developer";
    private String location;
    private String country = "in";
    private int page = 1;
    private int pageSize = 50;
    private List<String> categories = new ArrayList<>();

    public JobSearchCriteria() {
    }

    public JobSearchCriteria(String keyword, String location, String country, int page, int pageSize, List<String> categories) {
        this.keyword = keyword != null ? keyword : "developer";
        this.location = location;
        this.country = country != null ? country : "in";
        this.page = page > 0 ? page : 1;
        this.pageSize = pageSize > 0 ? pageSize : 50;
        this.categories = categories != null ? categories : new ArrayList<>();
    }

    public static Builder builder() {
        return new Builder();
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        JobSearchCriteria that = (JobSearchCriteria) o;
        return page == that.page && pageSize == that.pageSize &&
                Objects.equals(keyword, that.keyword) &&
                Objects.equals(location, that.location) &&
                Objects.equals(country, that.country) &&
                Objects.equals(categories, that.categories);
    }

    @Override
    public int hashCode() {
        return Objects.hash(keyword, location, country, page, pageSize, categories);
    }

    @Override
    public String toString() {
        return "JobSearchCriteria{" +
                "keyword='" + keyword + '\'' +
                ", location='" + location + '\'' +
                ", country='" + country + '\'' +
                ", page=" + page +
                ", pageSize=" + pageSize +
                ", categories=" + categories +
                '}';
    }

    public static class Builder {
        private String keyword = "developer";
        private String location;
        private String country = "in";
        private int page = 1;
        private int pageSize = 50;
        private List<String> categories = new ArrayList<>();

        public Builder keyword(String keyword) {
            this.keyword = keyword;
            return this;
        }

        public Builder location(String location) {
            this.location = location;
            return this;
        }

        public Builder country(String country) {
            this.country = country;
            return this;
        }

        public Builder page(int page) {
            this.page = page;
            return this;
        }

        public Builder pageSize(int pageSize) {
            this.pageSize = pageSize;
            return this;
        }

        public Builder categories(List<String> categories) {
            this.categories = categories;
            return this;
        }

        public JobSearchCriteria build() {
            return new JobSearchCriteria(keyword, location, country, page, pageSize, categories);
        }
    }
}
