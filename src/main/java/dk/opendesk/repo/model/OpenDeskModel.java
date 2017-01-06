package dk.opendesk.repo.model;

/**
 * Created by flemmingheidepedersen on 25/07/2016.
 */
import org.alfresco.service.namespace.QName;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

public interface OpenDeskModel {


    public static String OD_URI = "http://www.magenta-aps.dk/model/content/1.0";
    public static String OD_PREFIX = "od";


    // Groupnames

    public static String GLOBAL_PROJECTMANAGERS = "Projectmanagers";

    public static String PD_GROUP_PROJECTOWNER = "PD_PROJECTOWNER";
    public static String PD_GROUP_PROJECTMANAGER = "PD_PROJECTMANAGER";
    public static String PD_GROUP_PROJECTGROUP= "PD_PROJECTGROUP";
    public static String PD_GROUP_WORKGROUP = "PD_WORKGROUP";
    public static String PD_GROUP_MONITORS = "PD_MONITORS";

    /**
     * project states
     */


    public static String STATE_ACTIVE = "ACTIVE";
    public static String STATE_CLOSED = "CLOSED";


    /**
     * types
     */

    public static QName PROP_NOTIFICATION = QName.createQName(OD_URI, "notification");


    /**
     * aspects
     */

    public static QName ASPECT_PD = QName.createQName(OD_URI, "projecttype_projectdepartment");



    /**
     * Notification properties
     */
    public static QName PROP_NOTIFICATION_SUBJECT = QName.createQName(OD_URI, "subject");
    public static QName PROP_NOTIFICATION_MESSAGE = QName.createQName(OD_URI, "message");
    public static QName PROP_NOTIFICATION_READ = QName.createQName(OD_URI, "read");
    public static QName PROP_NOTIFICATION_CREATOR = QName.createQName(OD_URI, "creator");
    public static QName PROP_NOTIFICATION_DOCUMENT = QName.createQName(OD_URI, "document");
    public static QName PROP_NOTIFICATION_TYPE = QName.createQName(OD_URI, "type");



    /**
     * projectDepartment properties
     */
    public static QName PROP_PD_NAME = QName.createQName(OD_URI, "name");
    public static QName PROP_PD_DESCRIPTION = QName.createQName(OD_URI, "description");
    public static QName PROP_PD_SBSYS = QName.createQName(OD_URI, "sbsys");
    public static QName PROP_PD_STATE = QName.createQName(OD_URI, "state");
    public static QName PROP_PD_CENTERID = QName.createQName(OD_URI, "center_id");


    /**
     * Association Names
     */
    public static QName PROP_NOTIFICATION_ASSOC = QName.createQName(OD_URI, "ids");


    // this project needs to be bootstrapped - this project contains the root_folder of the company wide templates
    String templateProjectName = "skabelon";

    /**
     * TestSites
     */

    String testsite_1 = "Magenta_1";
    String testsite_2 = "Magenta_2";











}
