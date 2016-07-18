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
package dk.opendesk;

import com.google.gdata.data.Person;
import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.security.PersonService;
import org.alfresco.service.namespace.QName;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * A demonstration Java controller for the Hello World Web Script.
 *
 * @author martin.bergljung@alfresco.com
 * @since 2.1.0
 */
public class Notifications extends DeclarativeWebScript {


    private NodeService nodeService;
    private PersonService personService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }


    protected Map<String, Object> executeImpl (WebScriptRequest req, Status status, Cache cache) {

        NodeRef n = personService.getPerson("abeecher");

        Set<QName> aspects = nodeService.getAspects(n);

        for (QName aspect : aspects) {
//            System.out.println(aspect.getLocalName());
            if (aspect.getLocalName().equals("notifications")) {
                System.out.println("found");
                break;
            }
        }

        Map<QName, Serializable> allNodeProps = nodeService.getProperties(n);

        QName CUSTOM_ASPECT_QNAME = QName.createQName("http://www.magenta-aps.dk/model/content/1.0", "notifications");
        ArrayList name = (ArrayList)allNodeProps.get(CUSTOM_ASPECT_QNAME);
        System.out.println(name);

        ArrayList value = (ArrayList)nodeService.getProperty(n, CUSTOM_ASPECT_QNAME);






        Map<String, Object> model = new HashMap<String, Object>();
        model.put("fromJava", name.toString());

        System.out.println(model);



//        nodeService.addAspect(contentNodeRef, CUSTOM_ASPECT_QNAME, aspectValues);

//        nodeService.addAspect(contentNodeRef, CUSTOM_ASPECT_QNAME, aspectValues);

        return model;
    }


    protected Map<String, Object> getNotifications(String username) {

        return null;
    }

    protected Map<String, Object> addNotification(String username, String notification) {

        return null;
    }

    protected Map<String, Object> removeNotification(String username, String notificationID) {

        return null;
    }
}