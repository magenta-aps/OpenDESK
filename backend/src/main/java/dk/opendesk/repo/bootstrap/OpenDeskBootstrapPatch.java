package dk.opendesk.repo.bootstrap;

import dk.opendesk.repo.beans.NodeBean;
import org.alfresco.repo.admin.patch.impl.GenericBootstrapPatch;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.springframework.extensions.surf.util.I18NUtil;

import java.util.ArrayList;
import java.util.Arrays;

public class OpenDeskBootstrapPatch extends GenericBootstrapPatch {

    protected String checkNamePath;

    public void setCheckNamePath(String checkNamePath) {
        this.checkNamePath = checkNamePath;
    }

    private NodeBean nodeBean;

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
    }

    @Override
    protected String applyInternal() throws Exception {
        if (this.checkNamePath != null) {
            String[] split = checkNamePath.split("/");
            ArrayList<String> path = new ArrayList<>(Arrays.asList(split));
            try {
                nodeBean.getNodeByPath(path);
                return I18NUtil.getMessage("patch.genericBootstrap.result.exists", this.checkNamePath);
            } catch (FileNotFoundException e) {
                return super.applyInternal();
            }
        }
        return super.applyInternal();
    }
}
