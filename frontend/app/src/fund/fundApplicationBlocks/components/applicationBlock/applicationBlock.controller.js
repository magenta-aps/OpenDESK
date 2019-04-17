//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

'use strict'

angular
  .module('openDeskApp.fund')
  .controller('ApplicationBlockController', ['$scope', ApplicationBlockController])

function ApplicationBlockController ($scope) {
  var vm = this

  // Block: Basic Information
  vm.applicantName = null
  vm.projectTitle = null
  vm.applicationAmount = null
  vm.applicationTotalBudget = null

  // Block: Project Partners
  vm.applicantProjectPartnerName = null
  vm.applicantProjectPartnerCvr = null
  vm.applicantProjectPartnerContactPerson = null
  vm.applicantProjectPartnerRoll = null

  // Block: Project Description
  vm.applicationDateStart = null
  vm.applicationDateEnd = null
  vm.applicationTitle = null
  vm.applicationProjectDescription = null
  vm.applicationProjectArgument = null
  vm.applicationProjectOutput = null
  vm.applicationProjectNewsworthy = null
  vm.applicationProjectBenefit = null
  vm.applicationProjectSustainability = null

  $scope.$on('applicationWasLoaded', function () {
    // Block: Basic Information
    vm.applicantName          = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.describes == 'applicant_name') : {}
    vm.projectTitle           = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id        == 'project_title') : {}
    vm.applicationTotalBudget = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id        == 'total_budget') : {}
    vm.applicationAmount      = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.describes == 'applied_amount') : {}

    // Block: Project Partners
    vm.applicationProjectPartnerName        = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'company_name') : {}
    vm.applicantProjectPartnerCvr           = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'cvr_no') : {}
    vm.applicantProjectPartnerContactPerson = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'contact_person') : {}
    vm.applicantProjectPartnerRoll          = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'project_role') : {}

    // Block: Project Description
    vm.applicationDateStart             = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'start_date') : {}
    vm.applicationDateEnd               = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'end_date') : {}
    vm.applicationTitle                 = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'project_title') : {}
    vm.applicationProjectDescription    = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'project_description') : {}
    vm.applicationProjectArgument       = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'project_argument') : {}
    vm.applicationProjectOutput         = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'project_output') : {}
    vm.applicationProjectNewsworthy     = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'project_newsworthy') : {}
    vm.applicationProjectBenefit        = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'project_benefit') : {}
    vm.applicationProjectSustainability = $scope.$parent.allFields().length ? $scope.$parent.allFields().find(field => field.id == 'project_sustainability') : {}
  })
}
