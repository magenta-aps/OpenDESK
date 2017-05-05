var globalHeaderMenu = require('../common/globalHeader.po.js');

<<<<<<< HEAD
var AddMemberPage = function () {
    
    var public = {};


    public.getMembers = function() {

        var result =  element.all(by.repeater('member in members'));

        return result
    }


    public.addMember = function (project_name, member_name, member_role) {

        console.log("inside addMember");

        var newMemberBtn = element(by.css('[ng-click="vm.newMember($event)"]'));

        newMemberBtn.click();

        browser.driver.sleep(500);

        var addMemberName_element = element(by.css('md-autocomplete input#newMember'));
        var addMemberRole_element = element(by.model('newMemberRole'));

        addMemberName_element.sendKeys(member_name);

        browser.sleep(1500);
        browser.driver.actions().mouseMove(addMemberName_element);
        addMemberName_element.sendKeys(protractor.Key.ARROW_DOWN);
        addMemberName_element.sendKeys(protractor.Key.ENTER);

        addMemberRole_element.sendKeys(member_role);


        browser.driver.sleep(200);

        var addMemberBtn = element(by.id('addMemberBtn'));

        addMemberBtn.click();

        browser.driver.sleep(1000);

    }
=======
var LoginPage = function () {
    
    var public = {};

    /**
     * Default login as admin.
     */
    public.login = function() {
        public.loginAs(browser.params.loginDetails.admin.username, browser.params.loginDetails.admin.password);
    };

    public.loginAsAdmin = function () {
        public.loginAs(browser.params.loginDetails.admin.username, browser.params.loginDetails.admin.password);
    };

    public.loginAsUser = function (user) {
        public.loginAs(browser.params.loginDetails[user].username, browser.params.loginDetails[user].password);
    };

    /**
     * Lpgin as an arbitral user
     * @param userName
     * @param password
     */
    public.loginAs = function(userName, password) {
        //following PageObject pattern define the functions here.
        browser.get('http://localhost:8000');
        //The fields
        var userNameInput = element(by.model('vm.credentials.username'));
        var passwordInput = element(by.model('vm.credentials.password'));
        var loginBtn = element(by.css('[ng-click="vm.login(vm.credentials)"]')).click();

        userNameInput.sendKeys(userName);
        passwordInput.sendKeys(password);
        loginBtn.click();
        browser.driver.sleep(2000);
    };

    public.logout = function() {
        globalHeaderMenu.getHeaderMenuItem().userMenuBtn.click();
        element(by.xpath('//button[@id="logout"]')).click();
        browser.driver.sleep(2000);
    };
>>>>>>> develop

    return public;
};

<<<<<<< HEAD
module.exports = AddMemberPage();
=======
module.exports = LoginPage();
>>>>>>> develop
