#!/bin/bash

SERVICE_NAME=mysql
PWD_DEBIAN_SYS=wHEIppxTj1U8ulOK #a recuperer dans debian.cnf

if [ $# = 3 ] ; 
then
	if [ $(ls /var/lib/mysql/ | wc -l) = 0 ] 
	then
		echo "SET DATABASE";
		mysql_install_db; #si bdd vierge
	fi
	echo "RUN DATABASE";
	service $SERVICE_NAME start;

	if [ $(ls /var/lib/mysql/$1 | wc -l) = 0 ]
	then	
		echo "LOAD DATABASE";
		mysql -uroot -e "CREATE USER '$2'@'%' IDENTIFIED BY '$3';";
		mysql -uroot -e "GRANT ALL ON *.* TO '$2'@'%';";
		mysql -uroot -e "CREATE DATABASE $1;";
		mysql -uroot $1 < /home/database/structure.sql;
	fi
else
	echo "Nombre de parametres invalide";
fi

