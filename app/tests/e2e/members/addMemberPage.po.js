var AddMemberPage = function () {

    return {
        fillInputFields: function () {
            var memberInput = element(by.css('md-autocomplete[md-selected-item="selectedProjGrpItem"] input'));
            var firstMember = element.all(by.css('md-virtual-repeat-container[aria-hidden="false"] ul li')).first();
            memberInput.sendKeys('br'); //assumes an existing user called bruce lee (or something else with the letters br)
            firstMember.click();
            browser.driver.sleep('1000');
        }
    };
};

module.exports = AddMemberPage();