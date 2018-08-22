package dk.opendesk.webscripts;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.NameValuePair;
import org.apache.http.client.utils.URLEncodedUtils;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.IOException;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class OpenDeskWebScript extends AbstractWebScript {
    protected JSONObject contentParams;
    protected Map<String, String> urlParams;
    protected Map<String, String> urlQueryParams;
    protected JSONObject objectResult;
    protected JSONArray arrayResult;

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        arrayResult = new JSONArray();
        try {
            String content = req.getContent().getContent();
            if(content != null && !content.isEmpty())
                contentParams = new JSONObject(content);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        objectResult = new JSONObject();
        urlParams = req.getServiceMatch().getTemplateVars();
        urlQueryParams = parseUrlParams(req.getURL());
        res.setContentEncoding("UTF-8");
        res.setContentType("application/contentParams");
    }

    protected void error(WebScriptResponse res, Exception e) {
        e.printStackTrace();
        try {
            objectResult.put("error", e.getStackTrace()[0].toString());
        } catch (JSONException jsonE) {
            jsonE.printStackTrace();
        }
        res.setStatus(400);
    }

    private String paramValuesToString(List<NameValuePair> paramValues) {
        if (paramValues.size() == 1) {
            return paramValues.get(0).getValue();
        }
        List<String> values = paramValues.stream().map(NameValuePair::getValue).collect(Collectors.toList());
        return "[" + StringUtils.join(values, ",") + "]";
    }

    private Map<String, String> parseUrlParams(String url) {
        int queryStringStart = url.indexOf('?');
        String queryString = "";
        if (queryStringStart != -1) {
            queryString = url.substring(queryStringStart+1);
        }
        Map<String, String> parameters = URLEncodedUtils
                .parse(queryString, Charset.forName("UTF-8"))
                .stream()
                .collect(
                        Collectors.groupingBy(
                                NameValuePair::getName,
                                Collectors.collectingAndThen(Collectors.toList(), this::paramValuesToString)));
        return parameters;
    }

    protected void write(WebScriptResponse res) {
        try {
            if(objectResult.length() > 0)
                objectResult.write(res.getWriter());
            else if(arrayResult.size() > 0)
                arrayResult.writeJSONString(res.getWriter());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
