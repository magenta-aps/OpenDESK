// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.repo.bootstrap;

import java.util.ArrayList;
import java.util.List;

public class Group {
    private String shortName;
    private String displayName;
    private List<String> members;

    public Group(String shortName, String displayName) {
        this.shortName = shortName;
        this.displayName = displayName;
        this.members = new ArrayList<>();
    }

    public void addMembers(String member) {
        if(!members.contains(member))
            members.add(member);
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public List<String> getMembers() {
        return members;
    }
}
