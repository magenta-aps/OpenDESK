package dk.opendesk.webscripts;

/**
 * Created by flemmingheidepedersen on 10/10/2016.
 */


import org.alfresco.model.ContentModel;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.alfresco.service.namespace.NamespaceService;
import org.alfresco.service.namespace.QName;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 *
 * @author mturatti
 */
public class CleanupAndPurge extends DeclarativeWebScript {


    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    private SiteService siteService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    private NodeService nodeService;

    final Logger logger = LoggerFactory.getLogger(CleanupAndPurge.class);
    private NodeArchiveService nodeArchiveService;

    public void setNodeArchiveService(NodeArchiveService nodeArchiveService) {
        this.nodeArchiveService = nodeArchiveService;
    }

    @Override
    protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {

        List<SiteInfo> sites = siteService.listSites("","",100);

        Iterator i = sites.iterator();

        while (i.hasNext()) {
            SiteInfo s = (SiteInfo)i.next();
            System.out.println(s.getShortName());

            siteService.deleteSite(s.getShortName());
        }




        logger.info("@@@ Purging all archived nodes... ");
        final long start = System.currentTimeMillis();
        try {
            this.nodeArchiveService.purgeAllArchivedNodes(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
            this.setupSites();
        } catch (Throwable t) {
            logger.error("@@@ Error executing purge ", t);
            errorMessage(status, Status.STATUS_INTERNAL_SERVER_ERROR,
                    "Runtime error: " + t.getMessage() + ". Cause: " + t.getCause());
            return null;
        }
        final long elapsed = System.currentTimeMillis() - start;
        Map<String, Object> model = new HashMap<String, Object>();
        model.put("elapsed", elapsed);
        logger.info("@@@ Elapsed time (ms): " + elapsed);



        return model;
    }

    private void errorMessage(Status status, int code, final String message) {
        status.setCode(code);
        status.setMessage(message);
        status.setRedirect(true);
    }

    private void setupSites() {

//        var testSite1_name = "Magenta_1";
//        var testSite1_members = [{name : "abbecher", role : "siteConsumer"}];
//
//        var testSite2_name = "Magenta_2"
//        var testSite3_rename = "Magenta_rename"

        SiteInfo site = siteService.createSite("default", "Magenta_1", "Magenta_1", "no comments", SiteVisibility.PUBLIC);
        this.addDocumentFolder(site);

        site = siteService.createSite("default", "Magenta_2", "Magenta_2", "no comments", SiteVisibility.PUBLIC);
        this.addDocumentFolder(site);

        site = siteService.createSite("default", "Magenta_rename", "Magenta_rename", "no comments", SiteVisibility.PUBLIC);
        this.addDocumentFolder(site);
    }


    private void addDocumentFolder(SiteInfo site) {
        // Create documentLibary
        String defaultFolder = "documentLibrary";
        Map<QName, Serializable> documentLibaryProps = new HashMap<>();
        documentLibaryProps.put(ContentModel.PROP_NAME, defaultFolder);

        nodeService.createNode(site.getNodeRef(), ContentModel.ASSOC_CONTAINS,
                QName.createQName(NamespaceService.CONTENT_MODEL_1_0_URI, "documentLibrary"),
                ContentModel.TYPE_FOLDER, documentLibaryProps);
    }

}
