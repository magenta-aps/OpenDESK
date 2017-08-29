package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.repo.model.Repository;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class SettingsBean {


    private NodeService nodeService;
    private Repository repository;
    private FileFolderService fileFolderService;

    public void setNodeService(NodeService nodeService) {
        this.nodeService = nodeService;
    }
    public void setRepository(Repository repository)
    {
        this.repository = repository;
    }
    public void setFileFolderService(FileFolderService fileFolderService) {
        this.fileFolderService = fileFolderService;
    }

    public JSONObject getSettings() throws FileNotFoundException, JSONException {
        NodeRef settingsFolder = getSettingsFolder();
        String settings = nodeService.getProperty(settingsFolder, OpenDeskModel.PROP_SETTINGS).toString();
        return new JSONObject(settings);
    }

    public JSONObject getPublicSettings() throws FileNotFoundException, JSONException {
        JSONObject settings = getSettings();
        //Get properties that are public (Used before user is logged in)
        JSONObject publicSettings = new JSONObject();
        for(String settingProp : OpenDeskModel.PUBLIC_SETTINGS) {
            Object settingObject = settings.get(settingProp);
            publicSettings.put(settingProp, settingObject);
        }

        return publicSettings;
    }

    public NodeRef getSettingsFolder() throws FileNotFoundException {
        NodeRef companyHome = repository.getCompanyHome();
        return fileFolderService.resolveNamePath(companyHome, OpenDeskModel.PATH_OD_SETTINGS).getNodeRef();
    }

    public void updateSettings (Map<QName, Serializable> properties) throws FileNotFoundException {
        NodeRef settingsFolder = getSettingsFolder();
        nodeService.setProperties(settingsFolder, properties);
    }
}
