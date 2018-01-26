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