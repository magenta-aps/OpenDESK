package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.service.cmr.module.ModuleDetails;
import org.alfresco.service.cmr.module.ModuleService;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class EditorBean {

    private ModuleService moduleService;

    public void setModuleService(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    public JSONObject getEditors() throws JSONException {

        JSONObject result = new JSONObject();

        Map<String, String> modules = new HashMap<>();

        modules.put(OpenDeskModel.EDITOR_ONLYOFFICE, OpenDeskModel.MODULE_ONLYOFFICE);
        modules.put(OpenDeskModel.EDITOR_LIBREOFFICE, OpenDeskModel.MODULE_LIBREOFFICE);
        modules.put(OpenDeskModel.EDITOR_MS_OFFICE, OpenDeskModel.MODULE_AOS);

        // Add info for each module
        for (Map.Entry<String, String> moduleEntry : modules.entrySet()) {
            ModuleDetails moduleDetails = moduleService.getModule(moduleEntry.getValue());
            JSONObject module = new JSONObject();
            module.put("installed", moduleDetails != null);
            result.put(moduleEntry.getKey(), module);
        }

        return result;
    }
}
