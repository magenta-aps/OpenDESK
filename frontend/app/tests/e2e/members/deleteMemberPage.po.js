// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var deleteMemberPage = function () {

    return {

        findChipForMember: function(member) {
            var firstChip = element.all(by.repeater('$chip in $mdChipsCtrl.items')).first();

            return element.all(by.repeater('$chip in $mdChipsCtrl.items')).filter(function (elem) {
                //Return the element or elements
                return elem.getText().then(function (text) {
                    //Match the text
                    return text.indexOf(member) >= 0;
                });
            })
        },

        deleteChip: function (chip) {
            var deleteBtn = chip.element(by.css('button'));
            deleteBtn.click();
            browser.driver.sleep('500');
        },
    };
};

module.exports = deleteMemberPage();