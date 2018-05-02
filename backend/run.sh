#!/bin/bash
#if [[ -z ${MAVEN_OPTS} ]]; then
#    echo "The environment variable 'MAVEN_OPTS' is not set, setting it for you";
#    MAVEN_OPTS="-Xms256m -Xmx1524m -XX:PermSize=300m"
#fi
#echo "MAVEN_OPTS is set to '$MAVEN_OPTS'";
#mvn clean install -Pamp-to-war
#springloadedfile=~/downloads/springloaded-1.2.5.RELEASE.jar

MAVEN_OPTS="-noverify -Xms256m -Xmx4G -XX:PermSize=1024m" mvn clean integration-test -Pamp-to-war -DskipTests
