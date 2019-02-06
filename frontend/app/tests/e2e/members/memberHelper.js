// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var memberHelper = function () {

    return {
        openAddMemberDialog: function () {
            return element(by.css('[aria-label="Tilføj gruppemedlemmer"]')).click();
        },

        unfoldProjectGroup: function() {
            element(by.css('[aria-label="Add and remove members"] h4[aria-label="Project Group"]')).click();
        },

        unfoldProjectGroupList: function() {
            element(by.css('h4[aria-label="Project Group"]')).click();
        },

        findMemberInProjectList: function(member) {
            return element.all(by.repeater('member in group[1]')).filter(function (elem) {
                //Return the element or elements
                return elem.getText().then(function (text) {
                    //Match the text
                    return text.indexOf(member) >= 0;
                });
            })
        },

        update: function () {
            return element(by.css('[aria-label="Add and remove members"] button[type="submit"]')).click();
        }
    };
};

module.exports = memberHelper();