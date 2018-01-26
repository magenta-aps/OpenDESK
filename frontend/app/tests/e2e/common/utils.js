/**
 * Usage: Generate random string.
 * characterLength :  Length of string.
 * Returns : Random string.
 *
 * credit: http://qainsight.blogspot.dk/2014/04/get-random-string-email-string-and.html
 */
module.exports.generateRandomString = function (characterLength) {
    var randomText = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < characterLength; i++)
        randomText += possible.charAt(Math.floor(Math.random() * possible.length));
    return randomText;
};

/**
 * Usage: Return Random Email Id.
 */
module.exports.getRandomEmail = function () {
    var strValues = "abcdefghijk123456789";
    var strEmail = "";
    for (var i = 0; i < 7; i++) {
        strEmail = strEmail + strValues.charAt(Math.round(strValues.length * Math.random()));
    }
    return strEmail + "@magenta.dk";
};


module.exports.emptyTrashcan = function () {

    var request = require("request");

    request("http://localhost:8080/alfresco/service/api/login?u=admin&pw=bullerfisk1992", function (error, response, body) {
        ticket = body.replace("<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "")
        ticket = ticket.replace("<ticket>", "")
        ticket = ticket.replace("</ticket>", "")

        url = "http://localhost:8080/alfresco/s/purge?alf_ticket=" + ticket.trim();

        request(url, function (error, response, body) {
            console.log(body);
        });
    });
}

module.exports.loaddata = function () {


    browser.get("http://localhost:8000/#/testdata");



    //var request = require("request");
    //
    //request("http://localhost:8000/#/testdata", function (error, response, body) {
    //
    //    console.log(body);
    //
    //});
}