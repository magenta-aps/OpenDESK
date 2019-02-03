package dk.opendesk.repo.utils;

import java.util.Map;

public class Pager {

    public static final String MAX_ITEMS = "maxItems";
    public static final String SKIP_COUNT = "skipCount";

    public static int getMaxItems(Map<String, String> urlQueryParams) {
        return extractUrlQueryParam(urlQueryParams, MAX_ITEMS, Integer.MAX_VALUE);
    }

    public static int getSkipCount(Map<String, String> urlQueryParams) {
        return extractUrlQueryParam(urlQueryParams, SKIP_COUNT, 0);
    }

    private static int extractUrlQueryParam(Map<String, String> urlQueryParams, String param, int defaultValue) {
        String queryParamStr = urlQueryParams.get(param);
        return queryParamStr != null ? Integer.parseInt(queryParamStr) : defaultValue;
    }
}
