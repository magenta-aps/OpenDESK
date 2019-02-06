// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

var globalHeader = {
    dashboardBtn: element(by.xpath('//a[@ui-sref=\'dashboard\']')),
    casesBtn: element(by.xpath('//a[@ui-sref=\'cases\']')),
    tasksBtn: element(by.xpath('//a[@ui-sref=\'tasks\']')),
    userMenuBtn: element(by.xpath('//header/div/od-user/section/div/div[1]/button')),
    searchBoxInput: element(by.xpath('//div[@id=\'global-search\']//input'))
};

module.exports.getHeaderMenuItem = function () {
    return globalHeader;
};