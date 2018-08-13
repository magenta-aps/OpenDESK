package dk.opendesk.repo.beans;

import dk.opendesk.repo.utils.Utils;
import org.alfresco.service.cmr.repository.NodeRef;
import org.alfresco.service.cmr.repository.NodeService;
import org.alfresco.service.cmr.security.PersonService;
import org.json.JSONException;
import org.json.JSONObject;

public class PersonBean {


    private NodeService nodeService;
    private PersonService personService;

    public void setPersonService(PersonService personService) {
        this.personService = personService;
    }
    public void setNodeService(NodeService nodeService) { this.nodeService = nodeService; }

    /**
     * Converts a user into a standard structured JSONObject.
     * @param userName the name of the user to be converted.
     * @return a JSONObject representing the user.
     */
    public JSONObject getPerson(String userName) throws JSONException {
        NodeRef userRef = personService.getPerson(userName);
        return Utils.convertUserToJSON(nodeService, userRef);
    }
}
