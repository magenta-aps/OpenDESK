package dk.opendesk.webscripts.sbsys;

import java.io.IOException;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

public class FakeSbsysDownload extends AbstractWebScript {

	@Override
	public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
		
	res.getWriter().write("{\"foo\":\"bar\"}");
		return;

	}

}
