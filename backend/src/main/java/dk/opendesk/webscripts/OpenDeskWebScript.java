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
import java.io.Serializable;
import java.io.StringWriter;
import java.io.Writer;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
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
        res.setContentType("application/json");
    }

    /**
     * Fills an email template
     * @return a string containing the filled email template.
     */
    public String fillEmailTemplate(String emailFileName, Map<String, Object> model) {
        String templatePath = "OpenDesk/Templates/Emails/" + emailFileName;
        return fillTemplate(templatePath, model);
    }

    /**
     * Fills a template
     * @return a string containing the filled template.
     */
    public String fillTemplate(String templatePath, Map<String, Object> model) {
        Writer writer = new StringWriter();
        renderTemplate(templatePath, model, writer);
        return writer.toString();
    }

    protected String getContentParam(String parameter) throws JSONException {
        return getJSONObject(contentParams, parameter);
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

    protected ArrayList<String> getContentParamArray(String parameter) throws JSONException {
        ArrayList<String> result = new ArrayList<>();
        if (!contentParams.has(parameter) || contentParams.getJSONArray(parameter).length() == 0)
        {
            return result;
        }
        org.json.JSONArray jsonArray = contentParams.getJSONArray(parameter);
        for (int i=0; i < jsonArray.length(); i++) {
            String value = jsonArray.getString(i);
            result.add(value);
        }
        return result;
    }

    /**
     * Gets a child JSON object from a JSON object.
     * @param json Parent JSON object.
     * @param parameter the key of the child JSON object.
     * @return a child JSON Object with the specified parameter.
     */
    protected String getJSONObject(JSONObject json, String parameter) throws JSONException {
        if (!json.has(parameter) || json.getString(parameter).length() == 0)
        {
            return "";
        }
        return json.getString(parameter);
    }

    /**
     * Gets a JSONArray from a map.
     * @param map contains mapping of pairs.
     * @return a JSONArray containing the pairs as JSONObjects.
     */
    protected JSONArray getJSONReturnArray(Map<String, Serializable> map) {
        JSONObject return_json = new JSONObject();
        JSONArray result = new JSONArray();
        try {
            for (Map.Entry<String, Serializable> pair : map.entrySet())
                return_json.put(pair.getKey(), pair.getValue().toString());
            result.add(return_json);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    /**
     * Gets a JSONObject from a key-value pair.
     * @param key key of the object.
     * @param value value of the object.
     * @return a JSONArray containing the JSONObject.
     */
    protected JSONArray getJSONReturnPair (String key, String value) {
        Map<String, Serializable> map = new HashMap<>();
        map.put(key, value);
        return getJSONReturnArray(map);
    }

    /**
     * Gets a JSONArray representing succes.
     * @return a JSONArray containing { status : "succes" }.
     */
    protected JSONArray getJSONSuccess () {
        return getJSONReturnPair("status", "success");
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
