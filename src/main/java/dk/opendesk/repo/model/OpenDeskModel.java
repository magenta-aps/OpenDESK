package dk.opendesk.repo.model;

/**
 * Created by flemmingheidepedersen on 25/07/2016.
 */
import org.alfresco.service.namespace.QName;

public interface OpenDeskModel {


    String OD_URI = "http://www.magenta-aps.dk/model/content/1.0";
    String OD_PREFIX = "od";


    /**
     * types
     */

    QName PROP_NOTIFICATION = QName.createQName(OD_URI, "notification");



    /**
     * Notification properties
     */
    QName PROP_NOTIFICATION_SUBJECT = QName.createQName(OD_URI, "subject");
    QName PROP_NOTIFICATION_MESSAGE = QName.createQName(OD_URI, "message");
    QName PROP_NOTIFICATION_READ = QName.createQName(OD_URI, "read");


    /**
     * Association Names
     */
    QName PROP_NOTIFICATION_ASSOC = QName.createQName(OD_URI, "ids");

}
