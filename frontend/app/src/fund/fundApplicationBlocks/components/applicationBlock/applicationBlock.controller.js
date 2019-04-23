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
  // vm.applicantProjectPartnerName = null
  // vm.applicantProjectPartnerCvr = null
  // vm.applicantProjectPartnerContactPerson = null
  // vm.applicantProjectPartnerRoll = null
  vm.applicationProjectPartners = null

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
    vm.applicantName          = $scope.$parent.findField('describes', 'applicant_name')
    vm.projectTitle           = $scope.$parent.findField('id', 'project_title')
    vm.applicationTotalBudget = $scope.$parent.findField('id', 'total_budget')
    vm.applicationAmount      = $scope.$parent.findField('describes', 'applied_amount')

    // Block: Project Partners
    // vm.applicationProjectPartnerName        = $scope.$parent.findField('id', 'company_name')
    // vm.applicantProjectPartnerCvr           = $scope.$parent.findField('id', 'cvr_no')
    // vm.applicantProjectPartnerContactPerson = $scope.$parent.findField('id', 'contact_person')
    // vm.applicantProjectPartnerRoll          = $scope.$parent.findField('id', 'project_role')
    vm.applicationProjectPartners = $scope.$parent.application.blocks.filter(block => /^partners_/.test(block.id))

    // Block: Project Description
    vm.applicationDateStart             = $scope.$parent.findField('id', 'start_date')
    vm.applicationDateEnd               = $scope.$parent.findField('id', 'end_date')
    vm.applicationTitle                 = $scope.$parent.findField('id', 'project_title')
    vm.applicationProjectDescription    = $scope.$parent.findField('id', 'project_description')
    vm.applicationProjectArgument       = $scope.$parent.findField('id', 'project_argument')
    vm.applicationProjectOutput         = $scope.$parent.findField('id', 'project_output')
    vm.applicationProjectNewsworthy     = $scope.$parent.findField('id', 'project_newsworthy')
    vm.applicationProjectBenefit        = $scope.$parent.findField('id', 'project_benefit')
    vm.applicationProjectSustainability = $scope.$parent.findField('id', 'project_sustainability')
  })
}
