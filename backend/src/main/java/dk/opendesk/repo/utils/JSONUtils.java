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

}
