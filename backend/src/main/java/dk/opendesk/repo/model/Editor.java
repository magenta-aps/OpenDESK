// 
// Copyright (c) 2017-2018, Magenta ApS
// 
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
// 

package dk.opendesk.repo.model;

import java.util.ArrayList;
import java.util.List;

public class Editor {
    private List<String> mimeTypes;

    public Editor() {
        mimeTypes = new ArrayList<>();
    }

    public void addMimeType(String mimeType) {
        this.mimeTypes.add(mimeType);
    }

    public List<String> getMimeTypes() {
        return mimeTypes;
    }

    public boolean isMimeTypeSupported(String mimeType) {
        return mimeTypes.contains(mimeType);
    }

    public void setMimeTypes(List<String> mimeTypes) {
        this.mimeTypes = mimeTypes;
    }
}
