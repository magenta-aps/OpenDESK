// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var globalHeaderMenu = require('../common/globalHeader.po.js');
var projectName = '';
var projectList = [];

var CreateProjectPage = function () {

    var public = {};

    public.getCreatedProject = function () {
        return projectName;
    }

    public.getCreatedProjectUrl = function () {
        return 'http://localhost:8000/projekter/'+projectName+'/dokumenter';
    }

    public.openCreateProjectDialog = function() {
        element(by.css('[aria-label="Create new project"]')).click();
    }

    public.fillInputFields = function (name, isPrivate) {
        projectName = name;
        var private = isPrivate ? 'privat' : 'offentlig';

        var createProjectDialog = element(by.css('[aria-label="Opret projekt"]'));

        var templateInput = element(by.model('newSite.template.name'));
        var firstTemplate = element(by.css('[value="no-template"]'));
        var projectNameInput = element(by.model('newSite.siteName'));

        var projectOwnerInput = createProjectDialog.element(by.model(['$mdAutocompleteCtrl.scope.searchText']));
        var firstProjectOwner = element(by.css('.md-autocomplete-suggestions li'));

        var descriptionInput = element(by.model('newSite.desc'));
        var centerInput = element(by.model('newSite.center_id'));
        var firstCenter = element(by.css('.md-active md-option'));
        var sbsysInput = element(by.model('newSite.sbsys'));
        var privateInput = element(by.model('newSite.isPrivate'));

        templateInput.click();
        firstTemplate.click();
        projectNameInput.sendKeys(name);

        projectOwnerInput.sendKeys("a");
        firstProjectOwner.click();

        descriptionInput.sendKeys("Jeg er en beskrivelse");

        centerInput.click();
        firstCenter.click();

        sbsysInput.sendKeys("123456");

        if (isPrivate) {
            privateInput.click();
        }
    }

    public.createProject = function() {
        element(by.css('[aria-label="Create"]')).click();
    };


    return public;
};

module.exports = CreateProjectPage();