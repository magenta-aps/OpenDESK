var globalHeaderMenu = require('../common/globalHeader.po.js');


var OpenProjectPage = function () {

    return {
        openProjects: function () {
            var goToProjectBtn = element(by.css('a[href^="#!/projekter"]'));
            return goToProjectBtn.click();
        },

        openFirstProject: function() {
            var projectList = element.all(by.css('td a.od-filebrowser-link')).first();
            projectList.click();
        }
    };
};

module.exports = OpenProjectPage();