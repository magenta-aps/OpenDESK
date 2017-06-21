var memberHelper = function () {

    return {
        openAddMemberDialog: function () {
            return element(by.css('[aria-label="Tilføj gruppemedlemmer"]')).click();
        },

        fillInputFields: function () {
            var memberInput = element(by.css('md-autocomplete[md-selected-item="selectedProjGrpItem"] input'));
            var firstMember = element.all(by.css('md-virtual-repeat-container[aria-hidden="false"] ul li')).first();
            memberInput.sendKeys('br'); //assumes an existing user called bruce lee (or something else with the letters br)
            firstMember.click();
            browser.driver.sleep('1000');
        },

        unfoldProjectGroup: function() {
            element(by.css('[aria-label="Add and remove members"] h4[aria-label="Project Group"]')).click();
        },

        addProjectMember: function() {
            var memberInput = element.all(by.css('[aria-label="Add and remove members"] [md-selected-item="selectedProjGrpItem"]')).first();
            memberInput.click();
            memberInput.sendKeys('br');
        },

        unfoldGroup: function(groupName) {
            return element.all(by.repeater('(groupIndex, group) in groups.list')).filter(function (elem) {
                //Return the element or elements
                return elem.getText().then(function (group) {
                    //Match the text
                    return group.indexOf(groupName) >= 0;
                });
            });
        },

        update: function () {
            return element(by.css('[aria-label="Add and remove members"] button[type="submit"]')).click();
        }
    };
};

module.exports = memberHelper();