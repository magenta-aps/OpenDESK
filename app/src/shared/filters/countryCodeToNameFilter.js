angular
    .module('openDeskApp')
    .filter('countryCodeToName', countryCodeToNameFilter);

function countryCodeToNameFilter($translate) {
    return function (countryCode) {
        return countryCode ? $translate.instant('COUNTRY.' + countryCode) : undefined;
    };
}