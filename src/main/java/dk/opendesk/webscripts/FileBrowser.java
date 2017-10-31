/*
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package dk.opendesk.webscripts;

import dk.opendesk.repo.utils.Utils;
import org.alfresco.repo.model.Repository;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONException;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Writer;
import java.util.Map;

public class FileBrowser extends AbstractWebScript {

    private Repository repository;

    public void setRepository(Repository repository)
    {
        this.repository = repository;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        webScriptResponse.setContentEncoding("UTF-8");
        Writer webScriptWriter = webScriptResponse.getWriter();
        JSONArray result = new JSONArray();

        try {
            String method = params.get("method");
            if (method != null) {
                switch (method) {
                    case "getCompanyHome":
                        result = getCompanyHome();
                        break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            result = Utils.getJSONError(e);
            webScriptResponse.setStatus(400);
        }
        Utils.writeJSONArray(webScriptWriter, result);
    }

    /**
     * Gets the Company Home.
     * (method = getCompanyHome)
     * @return a JSONArray containing nodeRef of Company Home.
     */
    private JSONArray getCompanyHome() throws JSONException {
        NodeRef companyHome = repository.getCompanyHome();
        return Utils.getJSONReturnPair("nodeRef", companyHome.toString());
    }
}