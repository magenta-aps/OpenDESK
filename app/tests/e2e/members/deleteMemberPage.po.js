var deleteMemberPage = function () {

    return {

        getProjectMembers: function() {
            return element.all(by.css('ul[ng-show="pd.showProjGroupList"] a')).getInnerHtml();
        },

        openDeleteMemberDialog: function () {
            return element(by.css('[aria-label="Tilføj gruppemedlemmer"]')).click();
        },

        deleteChip: function () {
            var firstChip = element.all(by.repeater('$chip in $mdChipsCtrl.items')).first();
            var deleteBtn = firstChip.element(by.css('button'));
            deleteBtn.click();
            //var memberInput = element(by.css('md-autocomplete[md-selected-item="selectedProjGrpItem"] input'));
            //var firstMember = element.all(by.css('md-virtual-repeat-container[aria-hidden="false"] ul li')).first();
            //memberInput.sendKeys('br'); //assumes an existing user called bruce lee (or something else with the letters br)
            //firstMember.click();
            browser.driver.sleep('3000');
        },

        deleteMember: function () {
            return element(by.css('[aria-label="Add and remove members"] button[type="submit"]')).click();
        }
    };
};

module.exports = deleteMemberPage();