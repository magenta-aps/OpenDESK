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