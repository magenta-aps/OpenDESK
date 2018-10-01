package dk.opendesk.webscripts.sbsys;

import dk.opendesk.webscripts.OpenDeskWebScript;
import org.alfresco.service.cmr.model.FileExistsException;
import org.alfresco.service.cmr.model.FileFolderService;
import org.alfresco.service.cmr.model.FileNotFoundException;
import org.alfresco.service.cmr.repository.NodeRef;
import org.json.JSONArray;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;

public class FakeSbsysDownload extends OpenDeskWebScript {

	private FileFolderService fileFolderService;

	public void setFileFolderService(FileFolderService fileFolderService) {
		this.fileFolderService = fileFolderService;
	}

	@Override
	public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
		super.execute(req, res);
		try {
			String destinationNodeRefString = contentParams.getString("destinationNodeRef");
			JSONArray nodeRefs = contentParams.getJSONArray("nodeRefs");
			NodeRef destinationNodeRef = new NodeRef(destinationNodeRefString);

			try {
				for (int i = 0; i < nodeRefs.length(); i++) {
					String nodeRefString = nodeRefs.getString(i);
					NodeRef sourceNodeRef = new NodeRef(nodeRefString);
					fileFolderService.copy(sourceNodeRef, destinationNodeRef, null);
				}
				objectResult.put("success", true);
			} catch (FileExistsException e) {
				res.setStatus(412);
				objectResult.put("success", false);
				objectResult.put("message", "File(s) already exists");
			} catch (FileNotFoundException e) {
				res.setStatus(412);
				objectResult.put("success", false);
				objectResult.put("message", "File(s) not found");
			}

		} catch (Exception e) {
			error(res, e);
		}
		write(res);
	}

}
