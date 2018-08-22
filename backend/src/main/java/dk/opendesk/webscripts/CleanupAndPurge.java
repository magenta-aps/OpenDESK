package dk.opendesk.webscripts;

import dk.opendesk.repo.utils.Utils;
import org.alfresco.repo.node.archive.NodeArchiveService;
import org.alfresco.service.cmr.repository.ContentService;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.repository.StoreRef;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;
import org.alfresco.service.cmr.site.SiteVisibility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CleanupAndPurge extends DeclarativeWebScript {


    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    private SiteService siteService;

    public void setContentService(ContentService contentService) {
        this.contentService = contentService;
    }

    private ContentService contentService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }

    private NodeService nodeService;

    private final Logger logger = LoggerFactory.getLogger(CleanupAndPurge.class);
    private NodeArchiveService nodeArchiveService;

    public void setNodeArchiveService(NodeArchiveService nodeArchiveService) {
        this.nodeArchiveService = nodeArchiveService;
    }

    @Override
    protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {

        List<SiteInfo> sites = siteService.listSites("","",100);

        for (SiteInfo s : sites) {
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

    /**
     * Sets an error message.
     * @param status of the error.
     * @param code of the error.
     * @param message of the error.
     */
    private void errorMessage(Status status, int code, final String message) {
        status.setCode(code);
        status.setMessage(message);
        status.setRedirect(true);
    }

    /**
     * Sets up three test sites.
     */
    private void setupSites() {

        Utils.createSite(nodeService, contentService, siteService, "Magenta_1", "no comments", SiteVisibility.PUBLIC);
        Utils.createSite(nodeService, contentService, siteService, "Magenta_2", "no comments", SiteVisibility.PUBLIC);
        Utils.createSite(nodeService, contentService, siteService, "Magenta_rename", "no comments", SiteVisibility.PUBLIC);
    }

}
