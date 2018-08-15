package dk.opendesk.repo.beans;

import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.site.SiteInfo;
import org.alfresco.service.cmr.site.SiteService;

public class SiteBean {
    private SiteService siteService;
    public void setSiteService(SiteService siteService) {
        this.siteService = siteService;
    }

    public NodeRef getDocumentLibraryRef(String siteShortName) {
        return siteService.getContainer(siteShortName, SiteService.DOCUMENT_LIBRARY);
    }

    public SiteInfo getSiteInfo(String siteShortName) {
        return siteService.getSite(siteShortName);
    }

    public NodeRef getNodeRef(String siteShortName) {
        SiteInfo siteInfo = getSiteInfo(siteShortName);
        return siteInfo.getNodeRef();
    }
}
