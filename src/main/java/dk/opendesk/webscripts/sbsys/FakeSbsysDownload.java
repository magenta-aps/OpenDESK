package dk.opendesk.webscripts.sbsys;

import java.io.IOException;

import org.alfresco.service.cmr.model.FileExistsException;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptException;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

public class FakeSbsysDownload extends AbstractWebScript {

	private FileFolderService fileFolderService;

	/**
	 * Must receive JSON like this:
	 * {
	 *   "destinationNodeRef":"workspace://SpacesStore/97ebd9bf-41b2-4e8a-85cc-78a8837abbc",
	 *   "nodeRefs": ["workspace://SpacesStore/bf8a95ef-c6ba-42db-bc49-70dcbbe8ddab","workspace://SpacesStore/52fbbc13-38c0-4daa-8f62-362e319efea3"]
	 * }
	 */
	@Override
	public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {

		String payload = req.getContent().getContent();
		String destinationNodeRefString;

		JSONObject response = null;
		try {
			JSONObject request = new JSONObject(payload);
			response = new JSONObject();

			destinationNodeRefString = request.getString("destinationNodeRef");
			JSONArray nodeRefs = request.getJSONArray("nodeRefs");

			NodeRef destinationNodeRef = new NodeRef(destinationNodeRefString);

			try {
				for (int i = 0; i < nodeRefs.length(); i++) {
					String nodeRefString = nodeRefs.getString(i);
					NodeRef sourceNodeRef = new NodeRef(nodeRefString);
					fileFolderService.copy(sourceNodeRef, destinationNodeRef, null);
				}
				response.put("success", true);
			} catch (FileExistsException e) {
				res.setStatus(412);
				response.put("success", false);
				response.put("message", "File(s) already exists");
			} catch (FileNotFoundException e) {
				res.setStatus(412);
				response.put("success", false);
				response.put("message", "File(s) not found");
			}
			
		} catch (JSONException e) {
			e.printStackTrace();
			throw new WebScriptException("JSON error");
		}
		
		res.getWriter().write(response.toString());
		return;
	}

	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}

}
