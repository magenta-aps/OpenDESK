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
package dk.opendesk.webscripts.sites;

import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

public class Sites extends AbstractWebScript {


    public class CustomComparator implements Comparator<SiteInfo> {
        @Override
        public int compare(SiteInfo o1, SiteInfo o2) {
            return o1.getTitle().compareTo(o2.getTitle());
        }
    }

    private SiteService siteService;
    private NodeService nodeService;
    private PersonService personService;

    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }
    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        NodeRef nodeRef = null;
        String storeType = params.get("STORE_TYPE");
        String storeId = params.get("STORE_ID");
        String nodeId = params.get("NODE_ID");

        if (storeType != null && storeId != null && nodeId != null) {
            nodeRef = new NodeRef(storeType, storeId, nodeId);
        }


        String q = params.get("q");
        String method = params.get("method");

        if (method != null && method.equals("getAll")) {


            webScriptResponse.setContentEncoding("UTF-8");

            JSONArray result = this.getAllSites(q);
            try {
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }

        }
    }

    private JSONArray getAllSites(String q) {
        JSONArray result = new JSONArray();

        System.out.println("hvad er q" + q);

        //TODO : carefully choose the number of sites to return
        List<SiteInfo> sites = siteService.findSites(q, 2000);

        // need to reverse the order of sites as they appear in wrong sort order
        Collections.sort(sites, new CustomComparator());

        Iterator i = sites.iterator();

        while (i.hasNext()) {
            JSONObject json = new JSONObject();

            SiteInfo s = (SiteInfo)i.next();

            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                json.put("created", sdf.format( s.getCreatedDate() ));
                json.put("title", s.getTitle());
                json.put("shortName", s.getShortName());

                NodeRef n = s.getNodeRef();
                json.put("nodeRef", n.toString());
                JSONObject creator = new JSONObject();

                NodeRef cn = this.personService.getPerson((String)nodeService.getProperty(n, ContentModel.PROP_CREATOR));

                creator.put("userName", (String)nodeService.getProperty(n, ContentModel.PROP_CREATOR));
                creator.put("firstName", (String)nodeService.getProperty(cn, ContentModel.PROP_FIRSTNAME));
                creator.put("lastName", (String)nodeService.getProperty(cn, ContentModel.PROP_LASTNAME));
                creator.put("fullName", (String)nodeService.getProperty(cn, ContentModel.PROP_FIRSTNAME) +" "+(String)nodeService.getProperty(cn, ContentModel.PROP_LASTNAME));
                json.put("creator", creator);

                json.put("description", s.getDescription());
            } catch (JSONException e) {
                e.printStackTrace();
            }

            System.out.println(s);


            result.add(json);
        }

        return result;
        }
    }