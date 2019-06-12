//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

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
    private JSONObject publicSettings;
    private JSONObject settings;

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

    public JSONObject getPublicSettings() throws FileNotFoundException, JSONException {
        if(publicSettings == null)
            loadPublicSettings();
        return publicSettings;
    }

    public JSONObject getSettings() throws FileNotFoundException, JSONException {
        if(settings == null)
            loadSettings();
        return settings;
    }

    public NodeRef getSettingsFolder() throws FileNotFoundException {
        NodeRef companyHome = repository.getCompanyHome();
        return fileFolderService.resolveNamePath(companyHome, OpenDeskModel.PATH_OD_SETTINGS).getNodeRef();
    }

    private void loadPublicSettings() throws FileNotFoundException, JSONException {
        List<String> keys = new ArrayList<>();
        keys.add(OpenDeskModel.PUBLIC_SETTINGS);
        // We also send editor settings to make editors work with nodes that are shared publicly
        keys.add(OpenDeskModel.EDITOR_SETTINGS);

        JSONObject settings = getSettings();
        //Get properties that are public (Used before user is logged in)
        JSONObject result = new JSONObject();
        for(String key : keys)
            if(settings.has(key))
                result.put(key, settings.getJSONObject(key));

        publicSettings = result;
    }

    private void loadSettings() throws FileNotFoundException, JSONException {
        NodeRef settingsFolder = getSettingsFolder();
        String settingsString = nodeService.getProperty(settingsFolder, OpenDeskModel.PROP_SETTINGS).toString();
        settings = new JSONObject(settingsString);
    }

    public void updateSettings (Map<QName, Serializable> properties) throws FileNotFoundException, JSONException {
        NodeRef settingsFolder = getSettingsFolder();
        nodeService.setProperties(settingsFolder, properties);
        loadSettings();
        loadPublicSettings();
    }
}
