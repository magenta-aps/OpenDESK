//
// Copyright (c) 2017-2018, Magenta ApS
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//

import './users.module'

function importAll (r) {
  r.keys().forEach(r)
}

importAll(
  // including subdirectories, find all *.js files except those matching *.module.js
  require.context('./', true, /^(?!.*\.module\.js$).*\.js$/)
)
