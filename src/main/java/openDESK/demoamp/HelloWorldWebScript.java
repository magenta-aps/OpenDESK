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
package openDESK.demoamp;

import org.alfresco.service.namespace.QName;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * A demonstration Java controller for the Hello World Web Script.
 *
 * @author martin.bergljung@alfresco.com
 * @since 2.1.0
 */
public class HelloWorldWebScript extends DeclarativeWebScript {


    private NodeService nodeService;

    public void setNodeService(NodeService nodeService)

    {

        //  System.out.println(" dist ");

        this.nodeService = nodeService;

    }


    protected Map<String, Object> executeImpl (WebScriptRequest req, Status status, Cache cache) {

        Map<String, Object> model = new HashMap<String, Object>();
        model.put("fromJava", "Doh111  !");

        Map<QName,Serializable> aspectValues = new HashMap<QName,Serializable>();

        QName CUSTOM_ASPECT_QNAME = QName.createQName("od.notification", "metadata");

        QName PROP_QNAME_MY_PROPERTY = QName.createQName("od.subject", "masterID");

        aspectValues.put(PROP_QNAME_MY_PROPERTY, "testvaluevariable");

//        nodeService.addAspect(contentNodeRef, CUSTOM_ASPECT_QNAME, aspectValues);

//        nodeService.addAspect(contentNodeRef, CUSTOM_ASPECT_QNAME, aspectValues);

        return model;
    }
}