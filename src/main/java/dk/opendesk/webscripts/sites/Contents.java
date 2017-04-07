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

import dk.opendesk.repo.model.OpenDeskModel;
import dk.opendesk.repo.utils.Utils;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileInfo;
import org.alfresco.service.cmr.repository.ChildAssociationRef;
import org.alfresco.service.cmr.repository.ContentData;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.AccessStatus;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.QNamePattern;
import org.alfresco.service.namespace.RegexQNamePattern;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;
import org.w3c.dom.Node;

import java.io.IOException;
import java.io.Serializable;
import java.util.*;


public class Contents extends AbstractWebScript {


    private NodeService nodeService;

    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }

    private PersonService personService;
    private FileFolderService fileFolderService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;
    }

    public void setPermissionService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    private PermissionService permissionService;

    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    private SiteService siteService;

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        String nodeId = params.get("node");

        NodeRef nodeRef = new NodeRef("workspace://SpacesStore/" + nodeId);

        JSONArray result = this.getChildNodes(nodeRef);
        try {

            webScriptResponse.setContentEncoding("UTF-8");
            result.writeJSONString(webScriptResponse.getWriter());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }


    private JSONArray getChildNodes(NodeRef parentNodeRef) {

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(parentNodeRef);

        JSONArray result = new JSONArray();

        Iterator i = childAssociationRefs.iterator();

        while (i.hasNext()) {
            JSONObject json = new JSONObject();

            ChildAssociationRef childAssociationRef = (ChildAssociationRef) i.next();
            NodeRef childNodeRef = childAssociationRef.getChildRef();

            if (!nodeService.hasAspect(childNodeRef, ContentModel.ASPECT_HIDDEN)) {

                try {
                    String name = (String) nodeService.getProperty(childNodeRef, ContentModel.PROP_NAME);
                    json.put("name", name);

                    QName qname = nodeService.getType(childNodeRef);

                    String type;
                    if (qname.equals(ContentModel.TYPE_FOLDER)) {
                        type = "cmis:folder";
                    } else if (qname.equals(OpenDeskModel.PROP_LINK)) {
                        type = "cmis:link";
                    } else {
                        type = "cmis:document";
                        ContentData contentData = (ContentData) nodeService.getProperty(childNodeRef, ContentModel.PROP_CONTENT);
                        String mimeType = contentData.getMimetype();
                        json.put("mimeType", mimeType);
                    }

                    AccessStatus accessStatus = permissionService.hasPermission(childNodeRef, PermissionService.DELETE);
                    json.put("canMoveAndDelete", accessStatus == AccessStatus.ALLOWED);

                    json.put("contentType", type);

                    if (!"cmis:link".equals(type)) {
                        json.put("nodeRef", childNodeRef);

                        ChildAssociationRef parent = nodeService.getPrimaryParent(childNodeRef);

                        json.put("parentNodeRef", parent.getParentRef());
                        json.put("shortRef", childNodeRef.getId());


                        String modifier = (String) nodeService.getProperty(childNodeRef, ContentModel.PROP_MODIFIER);
                        NodeRef person = personService.getPerson(modifier);


                        json.put("lastChangedBy", nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + nodeService.getProperty(person, ContentModel.PROP_LASTNAME));


                        Date d = (Date) nodeService.getProperty(childNodeRef, ContentModel.PROP_MODIFIED);
                        json.put("lastChanged", d.getTime());

                        String label = (String) nodeService.getProperty(childNodeRef, ContentModel.PROP_VERSION_LABEL);


                        if (label != null && label.equals("1.0")) {
                            json.put("hasHistory", false);
                        } else {
                            json.put("hasHistory", true);
                        }
                    } else {
                        String linkSiteShortName = (String) nodeService.getProperty(childNodeRef, OpenDeskModel.PROP_LINK_TARGET);
                        NodeRef linkNodeRef = (NodeRef) nodeService.getProperty(childNodeRef, OpenDeskModel.PROP_LINK_TARGET_NODEREF);

                        json.put("nodeid", childNodeRef.getId());
                        json.put("destination_link", linkSiteShortName);

                        if (linkNodeRef != null) {
                            json.put("destination_nodeid", linkNodeRef.getId());

                            SiteInfo linkSiteInfo = siteService.getSite(linkSiteShortName);
                            String linkSiteDisplayName = linkSiteInfo.getTitle();
                            json.put("name", linkSiteDisplayName);
                        }
                    }

                    result.add(json);

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

        }

        return result;
    }
}
