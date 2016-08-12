# Getting started guide

Say you'll want to get some hacking done, here's what to do:

## Update and prep your codebase

1. We assume that you have your own clone of the codebase set up either locally or on a development server somewhere. Open a command line and browse to your project's location.
```
$ cd OpenDESK-UI
```

2. Now you'll want to make sure you have the latest changes. Update the _develop_ branch and run the build commands.
```
$ ./update-all.sh
```
This command checks out _develop_ branch, updates it, and runs npm and gulp commands so you'll have all the latest changes at hand. If you are prompted to select a npm package version (usually 1,2, or 3), just select the newest.

3. You never work directly on _develop_ branch, so it's time to switch to your working branch and add the changes to it. 
**If you don't have a working branch:** Create a new branch and add it to the repository like this:
```
$ git checkout -b yourBranchName
$ git push -u origin yourBranchName
```
When you have a working branch set up, check it out and merge the code from _develop_ into it.
```
$ git checkout yourBranchName
$ git merge develop
```

4. Open a browser and check if the new changes feature on your development installation. Sometimes the changes are not visible in the browser because of strange caching behaviours. Use the browser's history cleanup to clear the cache.


## Working with files

The [/app/src] directory will usually be the place to go to change something. Whenever you make a change, you'll need to run gulp build command to have your changes display in the browser.
```
$ gulp build
```
This will get tedious after a while. Instead, you can have gulp watch for changes as you make them and make new builds on the fly.
```
$ gulp watch
```
Let the watch script run and make changes to any .js, .html, or .scss file using your favorite tools. Changes should be visible in the browser immediately. If the changes don't show up for some reason, you can do another `gulp build` and clear the browser's cache to get the build in line again.


## Committing your changes

You have hacked away and are happy with your results. Now you'll want to share your work with the world.
Assuming you are current in your working branch, get an overview of the changed files.
```
$ git status
```
You should see a list of files ready for adding. It should look a little like this:
```
On branch develop
Your branch is up-to-date with 'origin/develop'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

	modified:   styles.scss
	modified:   someFolder/markup.html

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	moreStyles.scss

no changes added to commit (use "git add" and/or "git commit -a")
```
New files are listed under _Untracked files_ and existing modified files are listed under _Changes not staged for commit_.
You can add the files that you'll want to commit to the repository like this:
```
$ git add styles.scss
$ git add someFolder/markup.html
```
... etc. Or you can stage them for commit at once like this:
```
$ git add styles.scss someFolder/markup.html moreStyles.scss
```
Do `git status` again to see if the files you wanted to stage for commit are indeed staged.
```

```
