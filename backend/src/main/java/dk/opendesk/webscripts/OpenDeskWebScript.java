//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

package dk.opendesk.webscripts;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.service.namespace.QName;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.simple.JSONArray;
import org.springframework.extensions.surf.util.Content;
import org.springframework.extensions.webscripts.AbstractWebScript;
import org.springframework.extensions.webscripts.Status;
import org.springframework.extensions.webscripts.WebScriptRequest;
import org.springframework.extensions.webscripts.WebScriptResponse;

import java.io.*;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class OpenDeskWebScript extends AbstractWebScript {
    protected JSONObject contentParams;
    protected Map<String, String> urlParams;
    protected Map<String, String> urlQueryParams;
    protected JSONObject objectResult;
    protected JSONArray arrayResult;

    @Override
    public void execute(WebScriptRequest req, WebScriptResponse res) throws IOException {
        arrayResult = new JSONArray();
        String method = req.getServiceMatch().getWebScript().getDescription().getMethod();
        if(method.equals("PUT") || method.equals("POST")) {
            Content content = req.getContent();
            StringBuilder sb = new StringBuilder();

            String line;
            BufferedReader br = new BufferedReader(new InputStreamReader(content.getInputStream()));
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            String contentString = sb.toString();
            if(!contentString.isEmpty()) {
                try {
                    contentParams = new JSONObject(contentString);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }
        objectResult = new JSONObject();
        urlParams = req.getServiceMatch().getTemplateVars();
        urlQueryParams = parseUrlParams(req);
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

    protected Map<QName, Serializable> getContentMap(String parameter) throws JSONException {
        return getMap(contentParams, parameter);
    }

    protected JSONObject getContentObject(String parameter) throws JSONException {
        return getJSONObject(contentParams, parameter);
    }

    protected String getContentString(String parameter) throws JSONException {
        return getString(contentParams, parameter);
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

    protected void notFound(WebScriptResponse res) {
        try {
            objectResult = new JSONObject();
            objectResult.put("msg", "Not found");
        } catch (JSONException e) {
            e.printStackTrace();
        }
        res.setStatus(Status.STATUS_NOT_FOUND);
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

    private JSONObject getJSONObject(JSONObject json, String parameter) throws JSONException {
        if (!json.has(parameter) || json.getJSONObject(parameter).length() == 0)
        {
            return null;
        }
        return json.getJSONObject(parameter);
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

    private Map<QName, Serializable> getMap(JSONObject json, String parameter) throws JSONException {
        JSONObject jsonObject = getJSONObject(json, parameter);
        Map<QName, Serializable> map = new HashMap<>();
        Iterator keys = jsonObject.keys();
        while (keys.hasNext()) {
            String key = (String) keys.next();
            QName qName = QName.createQName(OpenDeskModel.OD_URI, key);
            map.put(qName, jsonObject.getString(key));
        }
        return map;
    }

    /**
     * Gets a child String from a JSON object.
     * @param json Parent JSON object.
     * @param parameter the key of the child JSON object.
     * @return a string.
     */
    private String getString(JSONObject json, String parameter) throws JSONException {
        if (!json.has(parameter) || json.getString(parameter).length() == 0)
        {
            return "";
        }
        return json.getString(parameter);
    }

    private Map<String, String> parseUrlParams(WebScriptRequest req) throws UnsupportedEncodingException {
        Map<String, String> parameters = new HashMap<>();
        for (String paramName : req.getParameterNames()) {
            String param = req.getParameter(paramName);
            String paramUTF = URLDecoder.decode(param, "UTF-8");
            parameters.put(paramName, paramUTF);
        }
        return parameters;
    }

    protected void write(WebScriptResponse res) {
        try {
            if(objectResult.length() > 0)
                objectResult.write(res.getWriter());
            else
                arrayResult.writeJSONString(res.getWriter());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
