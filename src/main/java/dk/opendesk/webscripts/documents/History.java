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
import org.alfresco.repo.security.authentication.AuthenticationUtil;
import org.alfresco.error.AlfrescoRuntimeException;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.repository.ChildAssociationRef;

import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.version.Version;
import org.alfresco.service.cmr.version.VersionHistory;
import org.alfresco.service.cmr.version.VersionService;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.RegexQNamePattern;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.*;
import org.springframework.extensions.webscripts.AbstractWebScript;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;

import org.alfresco.service.cmr.model.FileFolderService;


public class History extends AbstractWebScript {


    private NodeService nodeService;
    private PersonService personService;
    private VersionService versionService;

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

        System.out.println("hej");

        NodeRef nodeRef = null;
        String storeType = params.get("STORE_TYPE");
        String storeId = params.get("STORE_ID");
        String nodeId = params.get("NODE_ID");

        if (storeType != null && storeId != null && nodeId != null) {
            nodeRef = new NodeRef(storeType, storeId, nodeId);
        }

        String method = params.get("method");

        if (method != null && method.equals("getAll")) {

            JSONArray result = this.getVersion(nodeRef);
            try {
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }

        }
    }

    private JSONArray getVersion(NodeRef nodeRef) {

        System.out.println("nodeRef" + nodeRef);

        JSONArray result = new JSONArray();
        VersionHistory h = versionService.getVersionHistory(nodeRef);

        if (h != null) {
            Collection c = h.getAllVersions();

            Iterator i = c.iterator();

            while (i.hasNext()) {

                System.out.println("1'2");

                JSONObject json = new JSONObject();
                System.out.println("start:");
                Version v = (Version)i.next();

                try {

                    json.put("parent_nodeRef", nodeRef.getId());
                    json.put("nodeRef", v.getFrozenStateNodeRef().getId());

                    NodeRef modifier = this.personService.getPerson(v.getFrozenModifier());

                    json.put("modifier", ((String)nodeService.getProperty(modifier, ContentModel.PROP_FIRSTNAME)) + " " + (String)nodeService.getProperty(modifier, ContentModel.PROP_LASTNAME));

                    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                    json.put("created", sdf.format(v.getFrozenModifiedDate()));

                    json.put("version", v.getVersionLabel());

                    result.add(json);

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }

        return result;
    }
}

//http://localhost:8080/alfresco/s/filebrowser?&method=getAll&NODE_ID=bbf34889-6eed-4027-9e9d-aa6fb82ef922&STORE_TYPE=workspace&STORE_ID=SpacesStore