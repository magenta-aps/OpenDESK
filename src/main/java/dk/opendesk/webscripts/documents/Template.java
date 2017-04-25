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
package dk.opendesk.webscripts.documents;

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.service.cmr.model.FileExistsException;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.*;
import org.alfresco.service.cmr.search.ResultSet;
import org.alfresco.service.cmr.search.SearchService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.version.VersionService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class Template extends AbstractWebScript {


    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;
    }

    FileFolderService fileFolderService;

    private NodeService nodeService;
    private PersonService personService;
    private VersionService versionService;

    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    public void setSearchService(SearchService searchService) {
        this.searchService = searchService;
    }

    private SiteService siteService;
    private SearchService searchService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    public void setVersionService(VersionService versionService) {
        this.versionService = versionService;
    }
    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {
        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());


        String method = params.get("method");
        String fileName = params.get("fileName");

        if (method.equals("getAllTemplateDocuments")) {

            JSONArray response = new JSONArray();
            JSONArray children = new JSONArray();
            JSONObject json = new JSONObject();

            String query = "ASPECT:\"" + OpenDeskModel.ASPECT_PD_DOCUMENT + "\" ";

            StoreRef storeRef = new StoreRef(StoreRef.PROTOCOL_WORKSPACE, "SpacesStore");
            ResultSet siteSearchResult = searchService.query(storeRef, SearchService.LANGUAGE_LUCENE, query);

            if(siteSearchResult.length() == 0)
                return;

            NodeRef siteNodeRef = siteSearchResult.getNodeRef(0);
            SiteInfo siteInfo = siteService.getSite(siteNodeRef);

            NodeRef documentLibrary = siteService.getContainer(siteInfo.getShortName(), "documentlibrary");

            List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(documentLibrary);

            for (ChildAssociationRef child : childAssociationRefs) {
                json = new JSONObject();

                ContentData contentData = (ContentData) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_CONTENT);
                String originalMimeType = contentData.getMimetype();

                Map<QName, Serializable> props = nodeService.getProperties(child.getChildRef());
                String name = (String) props.get(ContentModel.PROP_NAME);


            try {
                json.put("nodeRef", child.getChildRef().getId());
                json.put("name", name);
                json.put("mimeType", originalMimeType);

                children.add(json);

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            try {
                response.add(children);
                response.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        else if (method.equals("makeNewDocumentFromTemplate")) {

            JSONArray response = new JSONArray();

            String template_nodeid = params.get("template_nodeid");
            String destination_nodeid = params.get("destination_nodeRefid");

            NodeRef template_nodeRef = new NodeRef("workspace://SpacesStore/" + template_nodeid);
            NodeRef destination_nodeRef = new NodeRef(destination_nodeid);


            List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(destination_nodeRef);

            int currentHigest = 0;
            String name = fileName.split("\\.")[0];
            String ext = fileName.split("\\.")[1];
            boolean match = false;

            for (ChildAssociationRef child : childAssociationRefs) {

                String file = (String) nodeService.getProperty(child.getChildRef(), ContentModel.PROP_NAME);
                String file_name = "";
                if (file.contains("(")) {
                    file_name = file.split("\\(")[0];
                }
                else {
                    file_name = file.split("\\.")[0];
                }

                if (file_name.trim().equals(name.trim())) {
                    match = true;
                    System.out.println("match");

                    int number = 0;
                    Matcher m = Pattern.compile("\\((.d?)\\)").matcher(file);
                    while(m.find()) {
                        number = Integer.valueOf(m.group(1));
                        System.out.println(number);
                    }

                    if (number > currentHigest) {
                        currentHigest = number;
                    }

                }
            }


            System.out.println("what is count:" + currentHigest);

            if (match) {
                currentHigest++;
                fileName = name + "(" + currentHigest + ")." + ext;
            }


            FileInfo newFile = null;

            try {
                newFile = fileFolderService.copy(template_nodeRef, destination_nodeRef, fileName);

                JSONObject json = new JSONObject();
                json.put("status", "success");
                json.put("nodeRef", newFile.getNodeRef());
                json.put("fileName", fileName);
                response.add(json);
                response.writeJSONString(webScriptResponse.getWriter());


            } catch (FileExistsException ex) {
                 ex.printStackTrace();

                // TODO apparently a file is still created with the name equal to the noderef instead of filename. Look into how this is deleted

                JSONObject json = new JSONObject();
                try {
                    json.put("status", "failure, file already exists");
                    response.add(json);
                    response.writeJSONString(webScriptResponse.getWriter());
                } catch (JSONException e1) {
                    e1.printStackTrace();
                }


            }

             catch (FileNotFoundException e) {
                 e.printStackTrace();
             }
            catch (JSONException ej) {

                ej.printStackTrace();
            }

        }
    }
}
