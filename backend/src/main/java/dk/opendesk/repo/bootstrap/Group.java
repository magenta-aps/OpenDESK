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
