'use strict';

angular.module('openDeskApp.discussion', ['ngMaterial', 'ng.ckeditor'])
    .config(config);


function config($stateProvider) {

    $stateProvider.state('project.discussions', {
            url: '/diskussioner',
            params: {
                selectedTab: 1
            },
            views: {
                'discussions': {
                    templateUrl: 'app/src/odDiscussion/view/overview.html',
                    controller: 'DiscussionController',
                    controllerAs: 'vm'
                }
            }
        })
        .state('project.viewthread', {
            url: '/diskussioner/{path:SlashFix}',
            params: {
                selectedTab: 1
            },
            views: {
                'discussions': {
                    templateUrl: 'app/src/odDiscussion/view/conversation.html',
                    controller: 'DiscussionController',
                    controllerAs: 'vm'
                }
            }
        });
}