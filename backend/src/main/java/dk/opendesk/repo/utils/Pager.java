//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

package dk.opendesk.repo.utils;

import org.springframework.extensions.surf.util.Pair;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

// TODO: throw PagerException if the URL query parameters are invalid

public class Pager {

    public static final String FLATTEN = "flatten";
    public static final String MAX_ITEMS = "maxItems";
    public static final String SKIP_COUNT = "skipCount";

    public static int getMaxItems(Map<String, String> urlQueryParams) {
        return extractUrlCounterQueryParam(urlQueryParams, MAX_ITEMS, Integer.MAX_VALUE);
    }

    public static int getSkipCount(Map<String, String> urlQueryParams) {
        return extractUrlCounterQueryParam(urlQueryParams, SKIP_COUNT, 0);
    }

    public static boolean getFlatten(Map<String, String> urlQueryParams) {
        String flatten = urlQueryParams.get(FLATTEN);
        return Boolean.parseBoolean(flatten);
    }

    public static <V> Pair<List<V>, Integer> pageResult(Set<V> set, int maxItems, int skipCount) {
        int totalCount = set.size();
        List<V> pagedMembers = set.stream()
                .sorted()
                .distinct()
                .skip(skipCount)
                .limit(maxItems)
                .collect(Collectors.toList());
        return new Pair<>(pagedMembers, totalCount);
    }

    private static int extractUrlCounterQueryParam(Map<String, String> urlQueryParams, String param, int defaultValue) {
        String queryParamStr = urlQueryParams.get(param);
        return queryParamStr != null ? Integer.parseInt(queryParamStr) : defaultValue;
    }
}
