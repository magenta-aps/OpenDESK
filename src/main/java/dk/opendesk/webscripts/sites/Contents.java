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
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.QName;
import org.alfresco.service.namespace.QNamePattern;
import org.alfresco.service.namespace.RegexQNamePattern;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

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

    @Override
    public void execute(WebScriptRequest webScriptRequest, WebScriptResponse webScriptResponse) throws IOException {

        Map<String, String> params = Utils.parseParameters(webScriptRequest.getURL());

        NodeRef nodeRef = null;

        String nodeId = params.get("node");


            nodeRef = new NodeRef("workspace://SpacesStore/" +  nodeId);

        System.out.println("hey");

            JSONArray result = this.getChildNodes(nodeRef);
            try {

                webScriptResponse.setContentEncoding("UTF-8");
                result.writeJSONString(webScriptResponse.getWriter());
            } catch (IOException e) {
                e.printStackTrace();
            }


    }


    private JSONArray getChildNodes(NodeRef nodeRef) {

        List<ChildAssociationRef> childAssociationRefs = nodeService.getChildAssocs(nodeRef);

        JSONArray result = new JSONArray();
        JSONArray children = new JSONArray();



        Iterator i = childAssociationRefs.iterator();

        while (i.hasNext()) {
            JSONObject json = new JSONObject();

            ChildAssociationRef childAssociationRef = (ChildAssociationRef)i.next();

            if (!nodeService.hasAspect(childAssociationRef.getChildRef(), ContentModel.ASPECT_HIDDEN)) {

                try {
                    json.put("name", nodeService.getProperty(childAssociationRef.getChildRef(), ContentModel.PROP_NAME));


                    QName qname = nodeService.getType(childAssociationRef.getChildRef());

                    String type;

                    if (qname.equals(ContentModel.TYPE_FOLDER)) {
                        type = "cmis:folder";
                    } else if (qname.equals(OpenDeskModel.TYPE_LINK)) {
                        type = "cmis:link";
                    } else {
                        type = "cmis:document";
                    }

                    json.put("contentType", type);

                    System.out.println(type);

                    if (type != "cmis:link") {
                        System.out.println("heyyyyy");
                        json.put("nodeRef", childAssociationRef.getChildRef());

                        ChildAssociationRef parent = nodeService.getPrimaryParent(childAssociationRef.getChildRef());

                        json.put("parentNode'Ref", parent.getParentRef());
                        json.put("shortRef", childAssociationRef.getChildRef().getId());


                        String modifier = (String) nodeService.getProperty(childAssociationRef.getChildRef(), ContentModel.PROP_MODIFIER);
                        NodeRef person = personService.getPerson(modifier);


                        json.put("lastChangedBy", nodeService.getProperty(person, ContentModel.PROP_FIRSTNAME) + " " + nodeService.getProperty(person, ContentModel.PROP_LASTNAME));


                        Date d = (Date) nodeService.getProperty(childAssociationRef.getChildRef(), ContentModel.PROP_MODIFIED);
                        json.put("lastChanged", d.getTime());

                        String label = (String) nodeService.getProperty(childAssociationRef.getChildRef(), ContentModel.PROP_VERSION_LABEL);

                        System.out.println("history");
                        System.out.println(label);

                        if (label != null && label.equals("1.0")) {
                            json.put("hasHistory", false);
                        } else {
                            json.put("hasHistory", true);
                        }
                    }
                    else {
                        String link = (String)nodeService.getProperty(childAssociationRef.getChildRef(), OpenDeskModel.PROP_LINK);
                        NodeRef link_node = (NodeRef)nodeService.getProperty(childAssociationRef.getChildRef(), OpenDeskModel.PROP_LINK_NODEREF);


                        json.put("nodeid", childAssociationRef.getChildRef().getId());
                        json.put("destination_link", link);
                        json.put("destination_nodeid", link_node.getId());
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
