#Documentation for OpenDesk development

Hi there. If you want to develop on OpenDesk, you've come to the right place.
Documentation now uses Markdown notation for ease of editing. [Learn markdown.](https://help.github.com/articles/basic-writing-and-formatting-syntax/)


## Technical info
Here are some technical details for developers.


### Problems with refresh when working with dialogs

We have had problems with refresh of components when working in a dialog. This is a problem caused by not beeing in the same scope.
The solution is to pass on the current scope to the dialog. Your component then has to be a part of the scope
It is illustrated in the following

```
// put your variable in the $scope
$scope.members = [];

// pass the current scope to your component
vm.uploadDocumentsDialog = function (event) {
    $mdDialog.show({
        templateUrl: 'app/src/sites/view/uploadDocuments.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: event,
        scope: $scope,        // use parent scope in template
        preserveScope: true,  // do not forget this if use parent scope
        clickOutsideToClose: true
    });
};

```

**Gotchas**
Don't add the controller again in the template, this will make refresh fail

```
<md-dialog aria-label="New member" ng-controller="SiteController as siteCtrl" ng-cloak>
```

If you do like above, the refresh will fail as the controller is loaded again. You dont need to add the controller, the variables are already available.


### Public site

A publicly facing site running OpenDesk can be found at http://178.62.208.124/#/


### Gulp

Gulp is a script handler that helps you build the site on the fly while developing. A complete build can be done by going to your project's dir in a terminal and running
```
$ gulp build
```
The gulp build task both compiles your JS and CSS, and runs a security check for known vunerabilities using Node Security Project.
To have Gulp watch and concatenate your SASS files when you edit them, use
```
$ gulp watch
```


### Git

You can make git remember your username for every push by going to console and entering
```
$ git config credential.username yourusername
```
Read more info on working with git in the workflow guide below.


## Workflow guide

When working on the OpenDesk project, you are advised to follow these guidelines:


### Always work on a separate branch

`develop` branch has the latest changes but you should never work directly on develop. Instead, create a feature or working branch and add/commit your changes to that. When you are finished working on a feature, do
```
$ git checkout develop
$ git pull
$ git checkout whateverYourBranchIs
$ git merge develop
Fix conflicts, if any
$ git checkout develop
$ git merge whateverYourBranchIs
$ git push
```


### Always be documenting

When you create a new widget or a better way of running the site or whatever, write a short description of it on this documentation page. The documentation page comes with the project files under
/documentation/README.md. Write it in there or add a README.md in the folder with the module/component that you're documenting (remember to supply a link from the main documentation).

You can access the documentation by browsing the [documentation folder on the github page.](https://github.com/magenta-aps/OpenDESK-UI/tree/develop/documentation)


### Naming conventions

Custom-made widgets, filters, directives, etc. should be named with a od prefix to indicate that they are particular to the OpenDesk project. Here is an example from the notifications directive:
```
.directive('odNotifications'; function() {})
<od-notifications>
<ul class="od-notifylist">
```


## How to update the staging environment

logon to the server with your user. I use this for my user:
```
ssh flemming@178.62.194.129
```
change to the folder where staging is setup:
```
cd /var/www/staging/OpenDESK-UI/
```

change the user to flemming, as i am the one who has checked it out from github
```
sudu su flemming
```

you will be prompted for your own user's password

enter the command:
```
git pull
```

now build the project and update any newly added dependencies
```
npm update
npm i  // (press 3 when you are prompted)

gulp local  // (to build the files - just press crtl d, to cancel the gulp server when its started)
```

finally restart the apache server
```
sudo service apache2 restart  // (you will be prompted for your own password)
```


## Widgets
Custom widgets are listed here along with tips on how to implement them.


### Dashboard tiles

We created a dashboard that will display the main features for the user. 
It consists of several tiles, implemented using the following HTML:
```
<div class="dashboard-grid">
    <div class="tile"></div>
</div>
```
Positioning and alignment is done through flex-box.
```
.dashboard-grid {    
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: space-between;
  
    .tile {
        flex-grow: 1;
        display: inline-block;
        width: 150px;
        height: 150px;
        overflow: hidden;
        margin: .25rem;
    }
}
```


### Flyout widget
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

**Options**
Adding class left or right to the flyout will make it appear from either the left or right hand side of the screen.

**od-title class for headers**
Adding the class od-title to any HTML element places that element in the header bar at the top of the screen. This is useful for elements that only appear once on every page. On the dashboard page, the user's name is placed in the top bar using od-title:
```
<h1 class="od-title">Hej [Someone]</h1>
```


### Notification widget

There is a notifications directive that you can pop in any template. Presently, it's featured in the index.html file so it shows up on every page. Using it is a matter of popping it into an HTML template using an od-notifications element.
```
<od-notifications></od-notifications>
```

**Methods**
The NotificationsController.js currently uses rmNotice() and addNotice() to add and remove fake notifications from the notifications list. addNotice() uses the $mdToast service to display a growl-like popup when a new notification is added.


## Modules

This area contains information specific to the various modules that OpenDesk app is made of.


### Projects

Projects (projekter) are navigated using states defined in app.module.js. There is a project state for individuel project views. They are defined like so:
```
.state('projects', {
    parent: 'site',
    url: '/projekter',
    views: {
        'content@': {
            templateUrl: 'app/src/sites/view/site.html',
            controller: 'SitesController',
            controllerAs: 'vm'
        }
    },
    data: {
        authorizedRoles: [USER_ROLES.user]
    }
}).state('project', {
    parent: 'site',
    url: '/projekter/:projekt',
    views: {
        'content@': {
            templateUrl: 'app/src/sites/view/sites.html',
            controller: 'SitesController',
            controllerAs: 'vm'
        }
    },
    data: {
        authorizedRoles: [USER_ROLES.user],
        selectedTab: 0
    }
})
```
:projekt is a variable for an individual project.

In SitesController:
```
vm.projekt = $stateParams.projekt;
```

In sites.html:
```
<ul class="od-list">
    <li ng-repeat="project in vm.sites">
        <a href="#/projekter/{{project.shortName}}"><i class="material-icons">work</i>  {{ project.title }}</a></li>
</ul>
```
... er der et link til den nye "state" defineret i app.module.js Man kan så bruge samme princip for at lave navigering på folder niveau, hvor site.html tilpasses med et link til niveauet under.


## Use cases

Below are the target use cases that OpenDesk will address. They are in Danish langauge.


### Jørgen fra HR

Jørgen arbejder hjemme og bruger sin Chromebook. Han er ansat i HR Han skal skrive en artikel til INTRA, hvor han også har brug for at udstille dokumenter fra SBSYS. Desuden skal han have planlagt møde med skolernes HR medarbejdere. Endelig skal han ind i Ofir og revidere nogle udkast til jobopslag. Jørgens normale arbejdsplads er Windows native på grund af de mange windows applikationer han normalt benytter.
Han adgang.ballerup.dk (Access Manager) og logger sig på med sin AD konto. Han modtager en sms med kode som han skriver ind.
Han kommer til INTRA og klikker på ”min arbejdsplads. Arbejdspladsen (Glaspladen) starter hvor han har følgende muligheder:
INTRA, Mail, Kalender, Dokumenter og projekter, Chat, Andre apps. Under ”Andre apps” har han adgang til Citrix apps, som for hans vedkommende er: SBSYS, Ofir Recruit, SD-løn, samt hele MS Office suiten. Hans Chromebook kan bruge den klientløse Receiver for HTML5
Han går ind på INTRA og skriver sin artikel, og tilføjer de 2 pdf filer fra SBSYS via at hente dem i Dokumenter/Alfresco
Han går ind i Kalender og finder et par mødetidspunkter for HR møde med skolernes HR folk. Der er 2 der ikke kan på disse tidspunkter. Han ser at de begge er online på Chatten, så han laver en chat-gruppe med dem begge og spørger om de kan flytte noget og hvilken dag der vil være bedst. Efter lidt dialog viser det sig at den ene dag godt kan bruges da de begge kan flytte nogle bookninger dér. Han booker mødet og tilføjer link til et dokument fra Alfresco på mødeindkaldelsen.
Han går så i ”Andre apps” og starter Ofir Recruit (Native Windows app). Hans citrix app starter uden login fordi hans identitetsinformationer parses videre fra adgang.ballerup.dk’s IDPservices


### Svend

Svend sidder som projektleder på ”Træn dig fri” indsatsen i Social &amp; Sundhed.
Han vil gerne have et hurtigt møde med de andre projektdeltagere, da han har fået tilsendt en ny forbedret støttestrømpe, som er endnu lettere anvende for de ældre.
Han går – via Arbejdspladsen – ind i ”Dokumenter og projekter” hvor han uploader dokumentationen om den nye strømpe. Han indkalder dem til et ’her og nu’ møde over Chatten. De bruger videofaciliteten, så alle kan se hinanden. De holder mødet og deler dokumenter fra leverandøren via skærmdelingen. Man får hurtigt fælles overblik og diskuteret business casen og taget en beslutning.
Uden muligheden for anvendelse af ”Presence” og videokonferencen havde det været nødvendigt at indkalde til et fysisk møde, og der havde for fem ud af seks deltagere været spildtid forbundet med transport til mødet. Alternativt havde man måske ikke fundet tiden til mødet og en ny lille innovativ idé var strandet i dagligdagen.
Svend kan gemme loggen fra mødet og lægger den op på ”dokumenter” under deres fælles projekt ”træn dig fri”. Fysisk ligger alle projektdokumenter nu i Alfresco og kan også tilgås dér via browser eller APP.
..en måned senere

”Træn dig fri” indsatsen i Social &amp; Sundhed blev en kæmpe succes med afslutning for ca. 300 ældre deltagere i Ballerup Arena.
Svend går dagen efter ind og uploader alle billederne til Alfresco projektmappen, som indeholder alle projektdokumenterne. Han opretter desuden et (word?)dokument og laver hurtigt referat af afslutningsseancen. Han markerer mappen og klikker på ”Journalisér til SBSYS” knappen. Han finder den rette Sagsskabelon i listen, sætter hak i ’Alle dokumenter’ og trykker ’Journalisér og luk’. Derefter går han ind og laver en nyhed på ’Nyheder – Social &amp; Sundhed’, og sætter det bedste billede ind som nyhedsbillede, samt linker 10 af de andre gode billeder ind fra Alfresco mappen. Sætter hak i ’Publicér til forside’ … og tar’ tidlig fyraften…


### Susanne

Susanne er ansat som lærer på Grantofteskolen.
Hun har en god historie omkring tiltag mod mobning, som hun gerne vil dele med sine kollegaer. Hun kan med sit UNI*C login logge på adgang.ballerup.dk, og via ”Arbejdspladsen” gå på INTRA og producere, redigere og publicerer historien under ”Nyheder – Grantofteskolen”.
Hun klikker på ”Tilføj SBSYS dokument”, fremsøger sagen fra SBSYS – og henter de 3 børneinterviews (pdf) ind som links i artiklen. Bagved hentes dokumenterne til Alfrescos Intra site. Når man klikker på linket i INTRA åbner Alfresco-vieweren dokumentet i en ny fane – så man kan læse det.    Hun tilføjer et link til DRs dokumentar fra i aftes, og sætter hak i ”publicér til forside”.
En central redaktør med ansvar for BK nyheder publicerer historien på forsiden af www.ballerup.dk. Der kommer en lang række gode kommentarer og likes – og på mindre end en dag er historien ude i store dele af Ballerup Kommune.
En pædagog fra børnehuset Lundegården ser artiklen på hjemmesiden. I BH Lundegården har man et lignende projekt kørende, og hun kontakter Susanne. De aftaler på tværs af de to områder at dele viden under ”Dokumenter og projekter”. Så kan man lære af hinanden og skabe nye bedre tiltag ift. mobning…
De går hver især ind på deres projekt og tilføjer hinandens projektdeltagere i delingsfaciliteten.


### Berit

Berit er børnehaveleder. Berit møder om morgenen. Inden dagens møde med fællestillidsmanden startet hun sin Mac bærbare og klikker på linket til adgang.ballerup.dk. Hun logger ind og præsenteres for Intra. Hun klikker på ”min arbejdsplads” og kommer ind Arbejdspladsen (Glaspladen).
I et vindue kan Berit kan se dagens kalender. Der er 20 minutter til aftalen med tillidsmanden. I vinduet ”leder nøgletal” (html) nederst til højre klikker Berit på alarmen med for ”hyppigt sygefravær”. Et nyt vindue (html) åbner med sygefraværsdata for Ulla på grøn stue.
Berit tjekker Ullas personalemappe i SDløn (native windows) som starter i et sømløst Citrix vindue. Login styres af Ballerup idp service.
Berit tjekker på Intra – lederportal reglerne for sygefraværssamtaler og samarbejdspolitikken. Berit ser at der i hendes notifikationer på arbejdspladsen, er en mail fra Ole – hendes personale konsulent i HR. Berit klikker på notifikationen og mailvinduet (html) åbner. Berit læser Oles kommentarer til hendes samtale med tillidsmanden om kommunens nye sygefraværs og fastholdelsespolitik. der er et link til politikken på Intra. Berit når at se en ny notifikation om at hendes nye nøglestal for økonomi er fine, samt at hendes souschef Karin har journaliseret en kladde til referat fra forældremødet aftenen inden. Det ligger til godkendelse i Dokumenter. Berit har stadig tid så hun klikker på linket til Referatet, læser det og godkender det. Referatet bliver automatisk journaliseret på den sag Karin har angivet. I Dokumenter står referatet nu som endeligt. Berit lukker vinduet logger ud, og er klar til samtalen med tillidsmanden.
Efter samtalen logger Berit ind på Arbejdspladsen (Glaspladen) og åbner personalesagen. Berit skriver sit referat af samtalen og sender et link til tillidsmanden. Når tillidsmanden har læst og accepteret referatet kan det gøres aktivt på personalesagen – indtil da optræder det i Dokumenter.
