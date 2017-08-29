package dk.opendesk.repo.utils;

import dk.opendesk.repo.model.OpenDeskModel;
import org.alfresco.service.namespace.QName;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.Serializable;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.*;

public class JSONUtils {

    public static JSONObject getObject(Map<QName, Serializable> map) throws JSONException {
        JSONObject result = new JSONObject();
            for (Map.Entry<QName, Serializable> pair : map.entrySet()) {
                String key = pair.getKey().getLocalName();
                Object value = pair.getValue();
                if (value != null && !"".equals(value)) {
                    String valueStr = value.toString();
                    if (valueStr.startsWith("[") && valueStr.endsWith("]")) {
                        value = new JSONArray(valueStr);
                    } else if (value.getClass() == Date.class) {
                        SimpleDateFormat date = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
                        TimeZone timeZone = TimeZone.getTimeZone("UTC");
                        date.setTimeZone(timeZone);
                        value = date.format(value);
                    }
                    result.put(key, value);
                }
            }
        return result;
    }

    public static JSONObject getObject (String key, String value) {
        JSONObject json = new JSONObject();
        try {
            json.put(key, value);
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return json;
    }

    public static JSONObject getObject(JSONObject json, String parameter) throws JSONException {
        if (!json.has(parameter) || json.getJSONObject(parameter).length() == 0)
        {
            return null;
        }
        return json.getJSONObject(parameter);
    }

    public static Map<QName, Serializable> getMap(JSONObject json) throws JSONException {
        Map<QName, Serializable> map = new HashMap<>();
        Iterator keys = json.keys();
        while (keys.hasNext()) {
            String key = (String) keys.next();
            QName qName = QName.createQName(OpenDeskModel.OD_URI, key);
            map.put(qName, json.getString(key));
        }
        return map;
    }

    /**
     * Writes JSON to the webscript writer.
     * @param writer a webscript writer.
     * @param result a JSONObject to be written.
     */
    public static void write (Writer writer, JSONObject result) {
        try {
            result.write(writer);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static JSONObject getSuccess () { return getObject("status", "success"); }

    /**
     * Gets a JSONArray representing an error.
     * @param e the exception.
     * @return a JSONArray containing the error message.
     */
    public static JSONObject getError (Exception e) {
        return getObject("error", e.getStackTrace()[0].toString());
    }

}
