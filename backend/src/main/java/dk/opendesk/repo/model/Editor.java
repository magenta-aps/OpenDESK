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
