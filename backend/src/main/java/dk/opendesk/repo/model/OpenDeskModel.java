package dk.opendesk.repo.model;

import org.alfresco.model.ContentModel;
import org.alfresco.service.cmr.security.PermissionService;
import org.alfresco.service.namespace.NamespacePrefixResolver;
import org.alfresco.service.namespace.QName;
import java.util.*;

public interface OpenDeskModel {

    // Sites
    String SITE = "Site";

    // SPECIAL SITES
    List<String> PATH_NODE_TEMPLATES = new ArrayList<>(Arrays.asList("Data Dictionary", "Node Templates"));
    List<String> PATH_SPACE_TEMPLATES = new ArrayList<>(Arrays.asList("Data Dictionary", "Space Templates"));
    List<String> PATH_OD_SETTINGS = new ArrayList<>(Arrays.asList("Data Dictionary", "OpenDesk Extension",
            "settings.xml"));


    // Containers
    String DISCUSSIONS = "discussions";
    String DOC_LIBRARY = "documentLibrary";
    String WIKI = "wiki"; // Not implemented yet
    String DATA_LISTS = "dataLists"; // Not implemented yet
    String LINKS = "links"; // Not implemented yet

    String OD_PREFIX = "od";
    String OD_URI = "http://www.magenta-aps.dk/model/content/1.0";

    // Roller
    String COLLABORATOR = "Collaborator";
    String CONSUMER = PermissionService.CONSUMER;
    String CONTRIBUTOR = PermissionService.CONTRIBUTOR;
    String MANAGER = "Manager";
    String OWNER = "Owner";
    String OUTSIDER = "Outsider";

    // Groupnames

    String PROJECT_OWNERS = "OPENDESK_ProjectOwners"; // a collection of all project owners
    String ORGANIZATIONAL_CENTERS = "OPENDESK_OrganizationalCenters"; // a collection of all organizational centers

    String PD_GROUP_PROJECTOWNER = "PD_PROJECTOWNER"; // projektejere
    String PD_GROUP_PROJECTMANAGER = "PD_PROJECTMANAGER"; // projektledere
    String PD_GROUP_PROJECTGROUP= "PD_PROJECTGROUP"; // projektgruppe
    String PD_GROUP_WORKGROUP = "PD_WORKGROUP"; // (arbejdsgruppe)
    String PD_GROUP_MONITORS = "PD_MONITORS"; // følgegruppe
    String PD_GROUP_STEERING_GROUP = "PD_STEERING_GROUP"; // styregruppe

    //Default site groups
    String SITE_MANAGER = SITE + MANAGER;
    String SITE_COLLABORATOR = SITE + COLLABORATOR;
    String SITE_CONTRIBUTOR = SITE + CONTRIBUTOR;
    String SITE_CONSUMER = SITE + CONSUMER;

    /**
     * project states
     */
    String STATE_ACTIVE = "ACTIVE";


    /**
     * types
     */
    QName PROP_NOTIFICATION = QName.createQName(OD_URI, "notification");
    String PD_NOTIFICATION_REVIEW_REQUEST = "review-request";
    String PD_NOTIFICATION_REVIEW_APPROVED = "review-approved";
    String PD_NOTIFICATION_NEWDOC = "new-doc";
    String PD_NOTIFICATION_REJECTED = "review-rejected";


    /**
     * aspects
     */

    QName ASPECT_PD = QName.createQName(OD_URI, "projecttype_projectdepartment");
    QName ASPECT_PD_TEMPLATE_SITES = QName.createQName(OD_URI, "projecttype_templates");
    QName ASPECT_PD_DOCUMENT = QName.createQName(OD_URI, "document_template");
    QName ASPECT_SHARED = QName.createQName(OD_URI, "shared");
    QName ASPECT_VERSION_PREVIEWABLE = QName.createQName(OD_URI, "version_previewable");



    /**
     * NotificationEventHandler properties
     */
    QName PROP_NOTIFICATION_SUBJECT = QName.createQName(OD_URI, "subject");
    QName PROP_NOTIFICATION_MESSAGE = QName.createQName(OD_URI, "message");
    QName PROP_NOTIFICATION_READ = QName.createQName(OD_URI, "read");
    QName PROP_NOTIFICATION_LINK = QName.createQName(OD_URI, "link");
    QName PROP_NOTIFICATION_SEEN = QName.createQName(OD_URI, "seen");
    QName PROP_NOTIFICATION_TYPE = QName.createQName(OD_URI, "type");
    QName PROP_NOTIFICATION_PROJECT = QName.createQName(OD_URI, "project");
    QName PROP_NOTIFICATION_PARAMS = QName.createQName(OD_URI, "params");
    String NOTIFICATION_TYPE_REVIEW = "review";
    String NOTIFICATION_TYPE_REVIEW_APPROVED = "review-approved";
    String NOTIFICATION_TYPE_REVIEW_REJECTED = "review-rejected";
    String NOTIFICATION_TYPE_CONTENT = "content";
    String NOTIFICATION_TYPE_SHARED_CONTENT = "shared-content";
    String NOTIFICATION_TYPE_SITE = "site";
    String NOTIFICATION_TYPE_DISCUSSION = "discussion";
    String NOTIFICATION_TYPE_REPLY = "reply";

    /**
     * Review properties
     */
    QName TYPE_REVIEW = QName.createQName(OD_URI, "review");
    QName PROP_REVIEW_ASSIGNEE = QName.createQName(OD_URI, "assignee");
    QName PROP_REVIEW_STATUS = QName.createQName(OD_URI, "status");
    QName ASPECT_REVIEWABLE = QName.createQName(OD_URI, "reviewable");
    QName ASSOC_REVIEWED = QName.createQName(OD_URI, "reviewed");
    String REVIEW_DISCUSSION = "review-discussion";


    /**
     * projectDepartment properties
     */
    QName PROP_PD_NAME = QName.createQName(OD_URI, "name");
    QName PROP_PD_DESCRIPTION = QName.createQName(OD_URI, "description");
    QName PROP_PD_SBSYS = QName.createQName(OD_URI, "sbsys");
    QName PROP_PD_STATE = QName.createQName(OD_URI, "state");
    QName PROP_PD_CENTERID = QName.createQName(OD_URI, "center_id");

    /**
     * projectlink properties
     */
    QName PROP_LINK = QName.createQName(OD_URI, "link");
    QName PROP_LINK_TARGET = QName.createQName(OD_URI, "targetproject");
    QName PROP_LINK_TARGET_NODEREF = QName.createQName(OD_URI, "targetproject_noderef");

    /**
     * settings properties
     */
    QName PROP_SETTINGS = QName.createQName(OD_URI, "settings");
    String PUBLIC_SETTINGS = "public";


    /**
     * Association Names
     */
    QName PROP_NOTIFICATION_ASSOC = QName.createQName(OD_URI, "ids");
    QName ASSOC_VERSION_PREVIEW = QName.createQName(OD_URI, "version_preview");


    /**
     * settings properties
     */
    QName PROP_SHARED_WITH = QName.createQName(OD_URI, "sharedWith");

    /**
     * Projecttypes
     */

    String project = "Project";
    String pd_project = "PD-Project";
    String template_project = "Template-Project";

    String TEMPLATE_OD_FOLDER = "/app:company_home/app:dictionary/cm:extensionwebscripts/cm:OpenDesk/cm:Templates/cm:Emails/";
    String TEMPLATE_EMAIL_BASE = "email.html.ftl";
    String TEMPLATE_EMAIL_INVITE_EXTERNAL_USER = "ekstern-bruger.html.ftl";

    /**
     * Node Picker
     */
    String NODE_PICKER_MY_DOCS = "my-docs";
    String NODE_PICKER_SHARED_DOCS = "shared-docs";
    String NODE_PICKER_SITES = "sites";

    /**
     * Editors
     */
    String MODULE_AOS = "alfresco-aos-module";
    String MODULE_LIBREOFFICE = "libreoffice-online-repo";
    String MODULE_ONLYOFFICE = "com.parashift.onlyoffice-alfresco-repo";
    String EDITOR_ONLYOFFICE = "onlyOffice";
    String EDITOR_LIBREOFFICE = "libreOffice";
    String EDITOR_MS_OFFICE = "msOffice";
}
