package dk.opendesk.repo.model;

/**
 * Created by flemmingheidepedersen on 25/07/2016.
 */
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.namespace.QName;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

public interface OpenDeskModel {


    public static String OD_URI = "http://www.magenta-aps.dk/model/content/1.0";
    public static String OD_PREFIX = "od";

    // Tilladelser
    public static String COLLABORATOR_DANISH = "Kan skrive";
    public static String CONSUMER_DANISH = "Kan læse";

    // Roller
    public static String COLLABORATOR = "Collaborator";
    public static String CONSUMER = PermissionService.CONSUMER;
    public static String MANAGER = "Manager";
    public static String OWNER = "Owner";
    public static String OUTSIDER = "Outsider";

    // Groupnames

    public static String GLOBAL_PROJECTMANAGERS = "GLOBAL_Projectmanagers"; // a collection of all projectmanagers
    public static String GLOBAL_OrganizationalCenters = "GLOBAL_OrganizationalCenters"; // a collection of all projectmanagers

    public static String PD_GROUP_PROJECTOWNER = "PD_PROJECTOWNER"; // projektejere
    public static String PD_GROUP_PROJECTMANAGER = "PD_PROJECTMANAGER"; // projektledere
    public static String PD_GROUP_PROJECTGROUP= "PD_PROJECTGROUP"; // projektgruppe
    public static String PD_GROUP_WORKGROUP = "PD_WORKGROUP"; // (arbejdsgruppe)
    public static String PD_GROUP_MONITORS = "PD_MONITORS"; // følgegruppe
    public static String PD_GROUP_STEERING_GROUP = "PD_STEERING_GROUP"; // styregruppe

    /**
     * project states
     */


    public static String STATE_ACTIVE = "ACTIVE";
    public static String STATE_CLOSED = "CLOSED";


    /**
     * types
     */

    public static QName PROP_NOTIFICATION = QName.createQName(OD_URI, "notification");

    public static QName TYPE_LINK = QName.createQName(OD_URI, "link");



    /**
     * aspects
     */

    public static QName ASPECT_PD = QName.createQName(OD_URI, "projecttype_projectdepartment");
    public static QName ASPECT_PD_TEMPLATE_SITES = QName.createQName(OD_URI, "projecttype_templates");



    /**
     * Notification properties
     */
    public static QName PROP_NOTIFICATION_SUBJECT = QName.createQName(OD_URI, "subject");
    public static QName PROP_NOTIFICATION_MESSAGE = QName.createQName(OD_URI, "message");
    public static QName PROP_NOTIFICATION_READ = QName.createQName(OD_URI, "read");
    public static QName PROP_NOTIFICATION_LINK = QName.createQName(OD_URI, "link");



    /**
     * projectDepartment properties
     */
    public static QName PROP_PD_NAME = QName.createQName(OD_URI, "name");
    public static QName PROP_PD_DESCRIPTION = QName.createQName(OD_URI, "description");
    public static QName PROP_PD_SBSYS = QName.createQName(OD_URI, "sbsys");
    public static QName PROP_PD_STATE = QName.createQName(OD_URI, "state");
    public static QName PROP_PD_CENTERID = QName.createQName(OD_URI, "center_id");

    /**
     * projectlink properties
     */
    public static QName PROP_LINK = QName.createQName(OD_URI, "targetproject");
    public static QName PROP_LINK_NODEREF = QName.createQName(OD_URI, "targetproject_noderef");

    /**
     * Association Names
     */
    public static QName PROP_NOTIFICATION_ASSOC = QName.createQName(OD_URI, "ids");


    // this project needs to be bootstrapped - this project contains the root_folder of the company wide templates
    String templateProjectName = "skabelon";


    // TODO refactor and use a list - now we need to update the delete sites in Sites.java aswell

    /**
     * TestSites
     */

    String testsite_1 = "Magenta_1";
    String testsite_2 = "Magenta_2";
    String testsite_rename = "Magenta_rename";
    String testsite_new_name = "Magenta_newrename";


    /**
     * Projecttypes
     */

    String project = "Project";
    String pd_project = "PD-Project";









}
