# GIT cheat sheet

A (hopefully) helpful list of common _git_ commands:

**Switch to another branch**
```
git checkout your_branch_name
```

**Create new local branch**
```
git checkout -b feature_branch_name
```

**Publish and sync branch to remote**
```
git push -u origin feature_branch_name
```

**Update current branch**
```
git pull
```

**Delete local branch**
```
git branch -d the_local_branch
```

**Merge changes from branch A to branch B**
```
git checkout branch_B
git merge branch_A
```

**List local branches**
Also displays the branch you are currently on
```
git branch
```

**Check status of files**
Check which files are added, untracked, etc.
```
git status
```

**Add files for commit**
```
git add filename
```

**Commit added files**
```
git commit -m 'write a commit note here'
```

**Push committed changes to repository**
```
git push
```

**Stash currently modified files for later**
```
git stash
```

**Retrieve stashed files into current branch**
```
git stash pop
```

**See code differences**
```
git diff develop feature/nanna -- booking/static/
```
See code differences in files in directory booking/static between the branches develop and feature/nanna

**Undo the last merge/commit**
```
git reset --HARD HEAD~
```
You merged or committed some things by mistake and want your branch to appear as the lastest version from remote (ish).

**Switch to using another remote repo**
```
git remote set-url origin https://github.com/iamfrank/dbptk-gui-backend.git
```

**Add another remote repo (ex upstream of forked repo)**
```
git remote add upstream https://github.com/whoever/whatever.git
```
Fetch all the branches of that remote into remote-tracking branches,
such as upstream/master:
```
git fetch upstream
```
Then make sure that you're on your master branch:
```
git checkout master
```
Rewrite your master branch so that any commits of yours that
aren't already in upstream/master are replayed on top of that
other branch:
```
git rebase upstream/master
```
If you don't want to rewrite the history of your master branch, (for example because other people may have cloned it) then you should replace the last command with
```
git merge upstream/master
```
However, for making further pull requests that are as clean as possible, it's probably better to rebase.
