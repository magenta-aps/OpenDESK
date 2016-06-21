# Flyout widget

The od-flyout widget is a sidenav that is used to present the sliding panels for userlisting and notification listing. We didn't use the md-sidenav because it didn't layout quite the way we'd like it to.
You can add a flyout to your view with this code:
```
<div class="od-flyout right" ng-class="{ open: on }" ng-click="toggleNotices()">
    <div class="od-flyout--body" ng-click="$event.stopPropagation()">
        <h2 class="od-flyout--title">Flyout title (optional)</h2>
        <button ng-click="toggleNotices()" class="od-btn od-flyout--close">
            <i class="material-icons">keyboard_arrow_right</i>
        </button>

        ... Put some content here

    </div>
</div>
```
You'll need edit your controller to be able close and open the flyout. Here we use a value on and a function toggleNotices. toggleNotices switches the class open when the flyout is on. The above example does not include a button to switch the flyout on. Refer to the code for odUser to see a complete implementation.


## Options

Adding class left or right to the flyout will make it appear from either the left or right hand side of the screen.


## od-title class for headers

Adding the class od-title to any HTML element places that element in the header bar at the top of the screen. This is useful for elements that only appear once on every page. On the dashboard page, the user's name is placed in the top bar using od-title:
```
<h1 class="od-title">Hej [Someone]</h1>
```
