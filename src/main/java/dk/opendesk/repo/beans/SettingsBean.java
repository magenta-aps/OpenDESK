package dk.opendesk.repo.beans;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.model.ContentModel;
import org.alfresco.repo.model.Repository;
import org.alfresco.service.cmr.dictionary.ClassDefinition;
import org.alfresco.service.cmr.dictionary.DictionaryService;
import org.alfresco.service.cmr.dictionary.PropertyDefinition;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.namespace.QName;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

public class SettingsBean {


    private NodeService nodeService;
    private Repository repository;
    private FileFolderService fileFolderService;
    private DictionaryService dictionaryService;

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
    public void setDictionaryService(DictionaryService dictionaryService) {
        this.dictionaryService = dictionaryService;
    }

    public Map<QName, Serializable> getSettings() throws FileNotFoundException {
        NodeRef settingsFolder = getSettingsFolder();

        //Only return the properties that are specific to the settings type
        ClassDefinition settingsClass = dictionaryService.getClass(OpenDeskModel.TYPE_SETTINGS);
        Map<QName, PropertyDefinition> settingsClassProps = settingsClass.getProperties();

        Map<QName, Serializable> settingsProps = nodeService.getProperties(settingsFolder);

        Map<QName, Serializable> result = new HashMap<>();
        for (Map.Entry<QName, PropertyDefinition> propDef : settingsClassProps.entrySet()) {
            if(!propDef.getKey().equals(ContentModel.PROP_NAME))
                result.put(propDef.getKey(), settingsProps.get(propDef.getKey()));
        }

        return result;
    }

    public Map<QName, Serializable> getPublicSettings() throws FileNotFoundException {
        NodeRef settingsFolder = getSettingsFolder();

        //Get properties that are public (Used before user is logged in)
        Map<QName, Serializable> result = new HashMap<>();
        for(QName settingProp : OpenDeskModel.PUBLIC_SETTINGS) {
            Serializable settingValue = nodeService.getProperty(settingsFolder, settingProp);
            result.put(settingProp, settingValue);
        }

        return result;
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
