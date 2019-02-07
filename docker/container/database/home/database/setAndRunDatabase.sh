#!/bin/bash

SERVICE_NAME=mysql

if [ $(ls /var/lib/mysql/ | wc -l) = 0 ]
then
    echo "SET DATABASE";
    mysql_install_db; #si bdd vierge
fi
echo "RUN DATABASE";
service $SERVICE_NAME start;

if [ $(ls /var/lib/mysql/$DB_NAME | wc -l) = 0 ]
then
	#mysql -uroot -e "GRANT ALL PRIVILEGES ON *.* TO 'debian-sys-maint'@'localhost' IDENTIFIED BY '$PWD_DEBIAN_SYS';"; #a recuperer dans debian.cnf
	#mysql -uroot -e "flush privileges;";
	
    echo "LOAD DATABASE";
    
    #USER ROOT_MEMO
    mysql -uroot -e "CREATE USER '$DB_USER_NAME'@'%' IDENTIFIED BY '$DB_USER_PASS';";
    mysql -uroot -e "GRANT ALL ON *.* TO '$DB_USER_NAME'@'%';";
    
	#USER READONLY
	mysql -uroot -e "CREATE USER 'readonly'@'%' IDENTIFIED BY 'ReAdOnLy';";
	mysql -uroot -e "GRANT SELECT ON *.* TO 'readonly'@'%';";    
	
	#USER REPLICATION_MEMO
	if [ -z $DB_USER_NAME_REPLI ]
	then
    	mysql -uroot -e "CREATE USER '$DB_USER_NAME_REPLI'@'%' IDENTIFIED BY '$DB_USER_PASS_REPLI';";
		mysql -uroot -e "GRANT REPLICATION CLIENT ON *.* TO '$DB_USER_NAME_REPLI'@'%'";
	fi
	
	#DB
    mysql -uroot -e "CREATE DATABASE $DB_NAME;";
    mysql -uroot $DB_NAME < /home/database/structure.sql;
fi

