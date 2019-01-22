// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.repo.beans;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;

public class SearchBean {

    private SearchService searchService;

    public void setSearchService (SearchService searchService) {
        this.searchService = searchService;
    }

    public NodeRef queryNode(String query) {
        ResultSet resultSet = searchService.query(new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore"),
                SearchService.LANGUAGE_LUCENE, query);

        if (resultSet.length()==0)
            return null;

        return resultSet.getNodeRef(0);
    }
}
