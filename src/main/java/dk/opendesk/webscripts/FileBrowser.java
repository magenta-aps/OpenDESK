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
import org.alfresco.model.ContentModel;
import org.alfresco.repo.site.SiteModel;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.*;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import java.io.IOException;
import java.io.Serializable;
import java.util.*;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import dk.opendesk.repo.utils.Utils;

public class FileBrowser extends AbstractWebScript {

    private NodeService nodeService;
    private PersonService personService;
    private FileFolderService fileFolderService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;

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


        String userName = params.get("userName");
        String method = params.get("method");

        if (method != null && method.equals("getAll")) {

            JSONArray result = this.getChildNodes(nodeRef);
            try {
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }

        }
    }


    private JSONArray getChildNodes(NodeRef nodeRef) {

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(nodeRef);

        JSONArray result = new JSONArray();
        JSONArray children = new JSONArray();
        JSONObject json = new JSONObject();

        try {
            json.put("primaryParent_nodeRef", nodeService.getPrimaryParent(nodeRef).getParentRef());
            json.put("primaryParent_name", nodeService.getProperty(nodeService.getPrimaryParent(nodeRef).getParentRef(), ContentModel.PROP_NAME));
            json.put("currentNodeRef_nodeRef", nodeRef.toString());
            json.put("currentNodeRef_name", nodeService.getProperty(nodeRef, ContentModel.PROP_NAME));
            result.add(json);

        } catch (JSONException e) {
            e.printStackTrace();
        }

        for (ChildAssociationRef child : childAssociationRefs) {
             json = new JSONObject();

            Map<QName, Serializable> props = nodeService.getProperties(child.getChildRef());

            String name = (String) props.get(ContentModel.PROP_NAME);
            Boolean hasChildren = false;

            QName nodeType = nodeService.getType(child.getChildRef());

            if (nodeType.equals(ContentModel.TYPE_FOLDER) || nodeType.equals(SiteModel.TYPE_SITE)) {
                List<FileInfo> folderChilds = fileFolderService.list(child.getChildRef());
                if (folderChilds.size() > 0) {
                    hasChildren = true;
                }
            }


            try {
                json.put("nodeRef", child.getChildRef());
                json.put("name", name);
                json.put("hasChildren", hasChildren);

                children.add(json);

            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        result.add(children);

        return result;
        }
    }