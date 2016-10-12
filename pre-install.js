var shelljs = require('shelljs');
var os = require('os');

/*
 What platform you're running on: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
 win32 (for 32 or 64 bit)
 */

var isWin = /^win32/.test(os.platform());
var isLinux = /^linux/.test(os.platform());
var isMac = /^darwin/.test(os.platform()) || /^freebsd/.test(os.platform());

shelljs.echo('*************************** pre install postgres!!! ************************************');

if (isLinux) {
  // For REDHAT LINUX
/*  if (shelljs.exec('sudo yum install postgresql-devel').code !== 0) {
    shelljs.echo('Error in install libpq-dev!!!');
    shelljs.exit(1);
  } else {
    shelljs.exec('npm install pg');
    shelljs.exec('npm install pg-native');
    shelljs.exec('npm install sequelize');
  }*/
  //For UBUNTU
   if (shelljs.exec('sudo apt-get install libpq-dev').code !== 0) {
     shelljs.echo('Error in install libpq-dev!!!');
     shelljs.exit(1);
   } else {
     shelljs.exec('npm install pg');
     shelljs.exec('npm install pg-native');
     shelljs.exec('npm install sequelize');
   }
} else if (isMac) {
  if (shelljs.exec('brew install postgres').code !== 0) {
    shelljs.echo('Error in install postgres!!!');
    shelljs.exit(1);
  } else {
    shelljs.exec('npm install pg');
    shelljs.exec('npm install pg-native');
    shelljs.exec('npm install sequelize');
  }
} else {
  //for other os, no support right now
  console.log('for other os, no support right now! Error for postgres db may occur. Please install postgres db manually if error occurs!');
  shelljs.exec('npm install pg');
  shelljs.exec('npm install pg-native');
  shelljs.exec('npm install sequelize');
}
