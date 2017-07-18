package dk.opendesk.repo.model;

/**
 * Created by flemmingheidepedersen on 25/07/2016.
 */
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.namespace.QName;

import java.lang.reflect.Array;
import java.util.*;

public interface OpenDeskModel {

    // Sites
    public static String SITE = "Site";

    // SPECIAL SITES
    public static List<String> NODE_TEMPLATES_PATH = new ArrayList<>(Arrays.asList("Data Dictionary", "Node Templates"));
    public static List<String> SPACE_TEMPLATES_PATH = new ArrayList<>(Arrays.asList("Data Dictionary", "Space Templates"));


    // Containers
    public static String DISCUSSIONS = "discussions";
    public static String DOC_LIBRARY = "documentLibrary";
    public static String WIKI = "wiki"; // Not implemented yet
    public static String DATA_LISTS = "dataLists"; // Not implemented yet
    public static String LINKS = "links"; // Not implemented yet

    public static String OD_URI = "http://www.magenta-aps.dk/model/content/1.0";
    public static String OD_PREFIX = "od";

    // Roller
    public static String COLLABORATOR = "Collaborator";
    public static String CONSUMER = PermissionService.CONSUMER;
    public static String CONTRIBUTOR = PermissionService.CONTRIBUTOR;
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

    //Default site groups
    public static String SITE_MANAGER = SITE + MANAGER;
    public static String SITE_COLLABORATOR = SITE + COLLABORATOR;
    public static String SITE_CONTRIBUTOR = SITE + CONTRIBUTOR;
    public static String SITE_CONSUMER = SITE + CONSUMER;

    /**
     * project states
     */


    public static String STATE_ACTIVE = "ACTIVE";
    public static String STATE_CLOSED = "CLOSED";


    /**
     * types
     */

    public static QName PROP_NOTIFICATION = QName.createQName(OD_URI, "notification");
    public static String PD_NOTIFICATION_REVIEW_REQUEST = "review-request";
    public static String PD_NOTIFICATION_REVIEW_APPROVED = "review-approved";
    public static String PD_NOTIFICATION_NEWDOC = "new-doc";
    public static String PD_NOTIFICATION_PROJECT = "project";
    public static String PD_NOTIFICATION_REJECTED = "review-rejected";



    public static QName PROP_LINK = QName.createQName(OD_URI, "link");

    /**
     * aspects
     */

    public static QName ASPECT_PD = QName.createQName(OD_URI, "projecttype_projectdepartment");
    public static QName ASPECT_PD_TEMPLATE_SITES = QName.createQName(OD_URI, "projecttype_templates");
    public static QName ASPECT_PD_DOCUMENT = QName.createQName(OD_URI, "document_template");



    /**
     * Notification properties
     */
    public static QName PROP_NOTIFICATION_SUBJECT = QName.createQName(OD_URI, "subject");
    public static QName PROP_NOTIFICATION_MESSAGE = QName.createQName(OD_URI, "message");
    public static QName PROP_NOTIFICATION_READ = QName.createQName(OD_URI, "read");
    public static QName PROP_NOTIFICATION_LINK = QName.createQName(OD_URI, "link");
    public static QName PROP_NOTIFICATION_SEEN = QName.createQName(OD_URI, "seen");
    public static QName PROP_NOTIFICATION_TYPE = QName.createQName(OD_URI, "type");
    public static QName PROP_NOTIFICATION_CREATOR = QName.createQName(OD_URI, "creator");
    public static QName PROP_NOTIFICATION_DOCUMENT = QName.createQName(OD_URI, "document");
    public static QName PROP_NOTIFICATION_PROJECT = QName.createQName(OD_URI, "project");



    /**
     * Properties for the template aspect
     */


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
    public static QName PROP_LINK_TARGET = QName.createQName(OD_URI, "targetproject");
    public static QName PROP_LINK_TARGET_NODEREF = QName.createQName(OD_URI, "targetproject_noderef");

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
    String template_project = "Template-Project";

}
