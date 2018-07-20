'use strict'
import '../user/user.module'
import '../user/user.service'
import '../notifications/notifications.module'
import '../notifications/notifications.service'
import '../shared/services/preferenceService'

angular.module('openDeskApp.header', ['openDeskApp.user', 'openDeskApp.notifications'])
