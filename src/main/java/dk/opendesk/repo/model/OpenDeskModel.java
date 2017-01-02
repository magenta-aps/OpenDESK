package dk.opendesk.repo.model;

/**
 * Created by flemmingheidepedersen on 25/07/2016.
 */
import org.alfresco.service.namespace.QName;

public interface OpenDeskModel {


    String OD_URI = "http://www.magenta-aps.dk/model/content/1.0";
    String OD_PREFIX = "od";




    // Groupnames

    String GLOBAL_PROJECTMANAGERS = "Projectmanagers";

    String PD_GROUP_PROJECTOWNER = "PD_PROJECTOWNER";
    String PD_GROUP_PROJECTMANAGER = "PD_PROJECTMANAGER";
    String PD_GROUP_PROJECTGROUP= "PD_PROJECTGROUP";
    String PD_GROUP_WORKGROUP = "PD_WORKGROUP";
    String PD_GROUP_MONITORS = "PD_MONITORS";

    /**
     * project states
     */


    String STATE_ACTIVE = "ACTIVE";
    String STATE_CLOSED = "CLOSED";


    /**
     * types
     */

    QName PROP_NOTIFICATION = QName.createQName(OD_URI, "notification");


    /**
     * aspects
     */

    QName ASPECT_PD = QName.createQName(OD_URI, "projecttype_projectdepartment");



    /**
     * Notification properties
     */
    QName PROP_NOTIFICATION_SUBJECT = QName.createQName(OD_URI, "subject");
    QName PROP_NOTIFICATION_MESSAGE = QName.createQName(OD_URI, "message");
    QName PROP_NOTIFICATION_READ = QName.createQName(OD_URI, "read");
    QName PROP_NOTIFICATION_CREATOR = QName.createQName(OD_URI, "creator");
    QName PROP_NOTIFICATION_DOCUMENT = QName.createQName(OD_URI, "document");
    QName PROP_NOTIFICATION_TYPE = QName.createQName(OD_URI, "type");



    /**
     * projectDepartment properties
     */
    QName PROP_PD_NAME = QName.createQName(OD_URI, "name");
    QName PROP_PD_DESCRIPTION = QName.createQName(OD_URI, "description");
    QName PROP_PD_SBSYS = QName.createQName(OD_URI, "sbsys");
    QName PROP_PD_STATE = QName.createQName(OD_URI, "state");


    /**
     * Association Names
     */
    QName PROP_NOTIFICATION_ASSOC = QName.createQName(OD_URI, "ids");



}
