package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.Editor;
import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.module.ModuleDetails;
import org.alfresco.service.cmr.module.ModuleService;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.*;

public class EditorBean {

    private ContentBean contentBean;
    private NodeBean nodeBean;

    private ModuleService moduleService;

    private Map<String, Editor> editors;
    private JSONObject editorObjects;

    public void setContentBean(ContentBean contentBean) {
        this.contentBean = contentBean;
    }

    public void setNodeBean(NodeBean nodeBean) {
        this.nodeBean = nodeBean;
    }

    public void setModuleService(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    private JSONObject getDefinition(String editorKey) throws JSONException {
        List<String> path = new ArrayList<>(OpenDeskModel.PATH_OD_EDITORS);
        path.add(editorKey + ".json");
        try {
            NodeRef nodeRef = nodeBean.getNodeByPath(path);
            return contentBean.getContent(nodeRef);
        } catch (FileNotFoundException e) {
            return null;
        }
    }

    public JSONObject getEditInfo(String mimetype) throws JSONException {
        JSONObject result = new JSONObject();
        Map<String, Editor> editors = getEditors();
        for (Map.Entry<String, Editor> editorEntry : editors.entrySet()) {
            String key = editorEntry.getKey();
            Editor editor = editorEntry.getValue();
            boolean isSupported = editor.isMimeTypeSupported(mimetype);
            result.put(key, isSupported);
        }
        return result;
    }

    public Map<String, Editor> getEditors() {
        return editors;
    }

    public JSONObject getEditorObjects() {
        return editorObjects;
    }

    public void loadEditors() throws JSONException {
        loadEditorObjects();
        editors = new HashMap<>();
        Iterator<String> keys = editorObjects.keys();
        while(keys.hasNext()) {
            // Create editor object
            Editor editor = new Editor();
            String editorKey = keys.next();
            if (editorObjects.get(editorKey) instanceof JSONObject) {
                JSONObject editorObject = (JSONObject) editorObjects.get(editorKey);
                // Get Mime types
                if(!editorObject.has("mimeTypes"))
                    continue;
                JSONArray mimeTypes = editorObject.getJSONArray("mimeTypes");
                for (int i = 0; i < mimeTypes.length(); i++) {
                    String mimeType = mimeTypes.getString(i);
                    editor.addMimeType(mimeType);
                }
                editors.put(editorKey, editor);
            }
        }
    }

    private void loadEditorObjects() throws JSONException {
        editorObjects = new JSONObject();
        Map<String, String> modules = new HashMap<>();
        modules.put(OpenDeskModel.EDITOR_ONLYOFFICE, OpenDeskModel.MODULE_ONLYOFFICE);
        modules.put(OpenDeskModel.EDITOR_LIBREOFFICE, OpenDeskModel.MODULE_LIBREOFFICE);
        modules.put(OpenDeskModel.EDITOR_MS_OFFICE, OpenDeskModel.MODULE_AOS);

        // Add info for each module
        for (Map.Entry<String, String> moduleEntry : modules.entrySet()) {
            String editorKey = moduleEntry.getKey();
            String entityName = moduleEntry.getValue();
            ModuleDetails moduleDetails = moduleService.getModule(entityName);
            JSONObject module = new JSONObject();
            boolean isInstalled = moduleDetails != null;
            if (isInstalled) {
                // Get definition
                JSONObject definition = getDefinition(editorKey);
                if(definition == null)
                    break;
                module = definition;
            }
            module.put("installed", isInstalled);
            editorObjects.put(editorKey, module);
        }
    }
}
