#
# Script to run git pull, npm update, npm install, and gulp build in one go
#

echo "************************************"
echo "Updating and building all your stuff"
echo "************************************"
echo "-------------------------------------------"
echo "Pulling latest development code from Github"
git checkout develop
git pull
echo "-------------------------"
echo "Updating npm package info"
npm update
echo "---------------------------"
echo "Installing new npm packages"
npm install
echo "------------------"
echo "Running gulp build"
gulp build
echo "--------------------------------------------------------------------------"
echo "You are now on branch 'develop' and running an updated version of OpenDesk"
echo "--------------------------------------------------------------------------"