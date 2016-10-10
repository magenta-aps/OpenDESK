#cd  /var/lib/jenkins/jobs/opendesk-ui/workspace
# cd $BASEDIR

declare -i LOOP_COUNT=0
declare -i MAX_LOOP_COUNT=120

#response=$(curl --write-out %{http_code} --silent --output /dev/null  http://178.62.194.129//alfresco/service/api/login\?u=admin\&pw=bullerfisk1992)
response=$(curl --write-out %{http_code} --silent --output /dev/null  http://localhost:8080/alfresco/service/api/login\?u=admin\&pw=admin)
while [ "$response" -ne "200" ]
do
	echo -e "\n-----> OPEN_E_TEST:Waiting for alfresco to start (not able to login as admin)"
	response=$(curl --write-out %{http_code} --silent --output /dev/null  http://localhost:8080/alfresco/service/api/login\?u=admin\&pw=admin)
	sleep 5
	((LOOP_COUNT++))
        if [ "$LOOP_COUNT" -gt "$MAX_LOOP_COUNT" ]; then
		#Kill selenium and exit
		curl -s -L http://localhost:4444/selenium-server/driver?cmd=shutDownSeleniumServer > /dev/null 2>&1
        	exit 1
        fi
done

echo -e "\n----------> OPENESDH Alfresco test repository contacted"

npm update
#npm install gulp
#npm install protractor
npm install
node node_modules/protractor/bin/webdriver-manager update

#Selenium and repo are available so we can begin
gulp local &
gulp_pid="$!"

echo -e "\n---------> The current gulp pid is: ${gulp_pid}"

# wait until selenium is up
while ! curl http://localhost:8000/#/ &>/dev/null; do :; done

echo -e "\n----------> localhost:8000 is up and running. Starting tests"

xvfb-run -a npm test
