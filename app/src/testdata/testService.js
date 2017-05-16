'use strict';



angular.module('openDeskApp.testdata').factory('testService', function ($http, $window, alfrescoNodeUtils, siteService, cmisService, $q) {


    var restBaseUrl = '/alfresco/service';


    // Note that OpenDeskModel in the repo should be updated according to the sites you add here

    var testSite1_name = "Magenta_1";
    var testSite1_members = [{name : "abbecher", role : "siteConsumer"}];

    var testSite2_name = "Magenta_2";
    var testSite3_rename = "Magenta_rename";


    var sites = new Array();
    sites.push(testSite1_name );
    sites.push(testSite2_name );
    sites.push(testSite3_rename );


    var files = [{name : "android.pdf", path : "app/src/testdata/android.pdf", mimetype : "application/pdf"},
                 {name : "github.odt", path : "app/src/testdata/github.odt", mimetype : "application/vnd.oasis.opendocument.text"},
                 {name : "github_toBeDeleted.odt", path : "app/src/testdata/github_toBeDeleted.odt", mimetype : "application/vnd.oasis.opendocument.text"}];


    return {

        addDocumentsToSites: function () {


            function uploadDocuments(siteName) {

                console.log("upload til " + siteName);

                var currentFolderNodeRef;
                var cmisQuery = siteName + "/documentLibrary/";

                return cmisService.getNode(cmisQuery).then(function (val) {

                    console.log("hej: " + ":" + siteName + ":= "+ val);

                    currentFolderNodeRef = val.data.properties["alfcmis:nodeRef"].value;

                    console.log("hej fra cmisService: " + siteName + " : " + currentFolderNodeRef);

                    for (var i in files) {

                        console.log(i + "til" + siteName);

                        let f = files[i];

                        $http.get('http://localhost:8000/' + f.path, {responseType: 'arraybuffer'}).then(function (response) {


                            // todo dynamize the mimetype
                            var file = new Blob([response.data], {type: 'application/pdf'});
                            file.name = f.name;

                            siteService.uploadFiles(file, currentFolderNodeRef);
                        })
                    }
                }).catch(console.log.bind("test:" + console)); //;
            }



            var defer = $q.defer();
            var promises = [];

            function lastTask(){

               console.log("last task")
                    defer.resolve();

            }


             for (var i in sites) {

               let s = sites[i];

                 console.log("uploading documents" + s);

                 promises.push( uploadDocuments(sites[i]));

             }

            $q.all(promises).then(lastTask);
            return defer.promise;



            //
            //for (var i in sites) {
            //    uploadDocuments(sites[i]);
            //}
        },

        addMembersToSite : function() {
            // todo dynamize the addMember

            siteService.addMemberToSite(testSite1_name, "abeecher", "SiteConsumer");
        }

        //removeTestSites: function () {
        //        return $http.get(restBaseUrl + "/sites?method=deleteTestSites").then(function (response) {
        //
        //            return $http.get(restBaseUrl + "/purge").then(function (response) {
        //                console.log("response")
        //                console.log(response)
        //                return response.data;
        //            });
        //        })
        //

        //}




    }
});
