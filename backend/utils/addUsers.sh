#!/usr/bin/env bash

## sofia

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"sofia", "firstName":"Sofia", "lastName":"Thomsen", "email":"Sofia@magenta.dk", "password":"sofia"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/sofia.jpg -F username=sofia 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:{{ serveradmin }}

## freja

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"freja", "firstName":"Freja", "lastName":"Thomsen", "email":"freja@magenta.dk", "password":"freja"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/freja.jpg -F username=freja 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin


## ella

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"ella", "firstName":"Ella", "lastName":"Thomsen", "email":"ella@magenta.dk", "password":"ella"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/ella.jpg -F username=ella 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## alma

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"alma", "firstName":"Alma", "lastName":"Thomsen", "email":"alma@magenta.dk", "password":"alma"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/alma.jpg -F username=alma 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## anna

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"anna", "firstName":"anna", "lastName":"Thomsen", "email":"anna@magenta.dk", "password":"anna"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/anna.jpg -F username=anna 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## amma

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"amma", "firstName":"Amma", "lastName":"Thomsen", "email":"amma@magenta.dk", "password":"amma"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/amma.jpg -F username=amma 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## laura

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"laura", "firstName":"Laura", "lastName":"Thomsen", "email":"laura@magenta.dk", "password":"laura"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/laura.jpg -F username=amma 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## clara

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"clara", "firstName":"Clara", "lastName":"Thomsen", "email":"clara@magenta.dk", "password":"clara"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/clara.jpg -F username=amma 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## ida

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"ida", "firstName":"Ida", "lastName":"Thomsen", "email":"ida@magenta.dk", "password":"ida"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/ida.jpg -F username=amma 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## isabella

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"isabella", "firstName":"Isabella", "lastName":"Thomsen", "email":"isabella@magenta.dk", "password":"isabella"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/isabella.jpg -F username=isabella 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin



## william

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"william", "firstName":"William", "lastName":"Thomsen", "email":"william@magenta.dk", "password":"william"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/william.jpg -F username=william 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## noah

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"noah", "firstName":"Noah", "lastName":"Thomsen", "email":"noah@magenta.dk", "password":"noah"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/noah.jpg -F username=noah 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## lucas

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"lucas", "firstName":"Lucas", "lastName":"Thomsen", "email":"lucas@magenta.dk", "password":"lucas"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/lucas.jpg -F username=lucas 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## emil

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"emil", "firstName":"Emil", "lastName":"Thomsen", "email":"emil@magenta.dk", "password":"emil"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/emil.jpg -F username=emil 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## oliver

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"oliver", "firstName":"Oliver", "lastName":"Thomsen", "email":"oliver@magenta.dk", "password":"oliver"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/oliver.jpg -F username=oliver 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## oscar

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"oscar", "firstName":"Oscar", "lastName":"Thomsen", "email":"oscar@magenta.dk", "password":"oscar"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/oscar.jpg -F username=oscar 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## victor

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"victor", "firstName":"Victor", "lastName":"Thomsen", "email":"victor@magenta.dk", "password":"victor"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/victor.jpg -F username=victor 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## malthe

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"malthe", "firstName":"Malthe", "lastName":"Thomsen", "email":"malthe@magenta.dk", "password":"malthe"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/malthe.jpg -F username=malthe 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## alfred

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"alfred", "firstName":"Alfred", "lastName":"Thomsen", "email":"alfred@magenta.dk", "password":"alfred"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/alfred.jpg -F username=alfred 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

## carl

curl -i -u admin:admin -X POST -H "Content-Type: application/json" -d '{"userName":"carl", "firstName":"Carl", "lastName":"Thomsen", "email":"carl@magenta.dk", "password":"carl"}' http://localhost:8080/alfresco/s/api/people
curl -v -X POST -F filedata=@avatars/carl.jpg -F username=carl 'http://localhost:8080/alfresco/service/slingshot/profile/uploadavatar' -u admin:admin

