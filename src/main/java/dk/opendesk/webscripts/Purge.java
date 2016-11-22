package dk.opendesk.webscripts;

/**
 * Created by flemmingheidepedersen on 10/10/2016.
 */


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

import org.alfresco.repo.node.archive.NodeArchiveService;
import org.springframework.extensions.webscripts.Cache;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.DeclarativeWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.alfresco.service.cmr.repository.StoreRef;

/**
 *
 * @author mturatti
 */
public class Purge extends DeclarativeWebScript {

    final Logger logger = LoggerFactory.getLogger(Purge.class);
    private NodeArchiveService nodeArchiveService;

    public void setNodeArchiveService(NodeArchiveService nodeArchiveService) {
        this.nodeArchiveService = nodeArchiveService;
    }

    @Override
    protected Map<String, Object> executeImpl(WebScriptRequest req, Status status, Cache cache) {
        logger.info("@@@ Purging all archived nodes... ");
        final long start = System.currentTimeMillis();
        try {
            this.nodeArchiveService.purgeAllArchivedNodes(StoreRef.STORE_REF_WORKSPACE_SPACESSTORE);
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
}
