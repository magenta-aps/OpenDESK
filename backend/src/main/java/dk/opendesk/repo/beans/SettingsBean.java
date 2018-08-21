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
import java.util.ArrayList;
import java.util.List;
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
        List<String> keys = new ArrayList<>();
        keys.add(OpenDeskModel.PUBLIC_SETTINGS);
        // We also send editor settings to make editors work with nodes that are shared publicly
        keys.add(OpenDeskModel.EDITOR_SETTINGS);

        JSONObject settings = getSettings();
        //Get properties that are public (Used before user is logged in)
        JSONObject publicSettings = new JSONObject();
        for(String key : keys)
            if(settings.has(key))
                publicSettings.put(key, settings.getJSONObject(key));

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
