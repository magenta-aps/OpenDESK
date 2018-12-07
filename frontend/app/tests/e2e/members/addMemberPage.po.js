// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var AddMemberPage = function () {

    return {
        fillInputFields: function (member) {
            var memberInput = element(by.css('md-autocomplete[md-selected-item="selectedProjGrpItem"] input'));
            var firstMember = element.all(by.css('md-virtual-repeat-container[aria-hidden="false"] ul li')).first();
            memberInput.click();
            memberInput.sendKeys(member);
            firstMember.click();
        }
    };
};

module.exports = AddMemberPage();