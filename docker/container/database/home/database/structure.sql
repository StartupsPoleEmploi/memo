-- MySQL dump 10.13  Distrib 5.7.23, for Linux (x86_64)
--
-- Host: 167.114.255.92    Database: motivaction
-- ------------------------------------------------------
-- Server version	5.5.5-10.0.37-MariaDB-0+deb8u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adminUsers`
--

DROP TABLE IF EXISTS `adminUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adminUsers` (
  `userId` bigint(20) NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `userId_UNIQUE` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attachmentFiles`
--

DROP TABLE IF EXISTS `attachmentFiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attachmentFiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `md5` varchar(32) NOT NULL,
  `userId` bigint(20) NOT NULL,
  `fileData` mediumblob,
  PRIMARY KEY (`id`),
  KEY `md5` (`md5`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=59343 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attachments`
--

DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attachments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `md5` varchar(32) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `userId` bigint(20) NOT NULL,
  `candidatureId` bigint(20) NOT NULL,
  `virusChecked` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `md5` (`md5`),
  KEY `candidatureId` (`candidatureId`)
) ENGINE=InnoDB AUTO_INCREMENT=97127 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `candidatureEvents`
--

DROP TABLE IF EXISTS `candidatureEvents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `candidatureEvents` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `candidatureId` bigint(20) unsigned NOT NULL,
  `creationTime` datetime NOT NULL,
  `eventTime` datetime DEFAULT NULL,
  `eventType` tinyint(4) NOT NULL DEFAULT '0',
  `eventSubType` tinyint(4) NOT NULL DEFAULT '0',
  `comment` text,
  PRIMARY KEY (`id`),
  KEY `candidatureId_idx` (`candidatureId`),
  KEY `eventTypeIdx` (`eventType`),
  KEY `eventSubTypeIdx` (`eventSubType`),
  CONSTRAINT `candidatureId` FOREIGN KEY (`candidatureId`) REFERENCES `candidatures` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6225021 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `candidatures`
--

DROP TABLE IF EXISTS `candidatures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `candidatures` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) unsigned NOT NULL,
  `nomCandidature` varchar(128) NOT NULL DEFAULT '',
  `nomSociete` varchar(128) DEFAULT '',
  `description` text,
  `dateCandidature` datetime DEFAULT NULL,
  `lastUpdate` datetime DEFAULT NULL,
  `etat` tinyint(3) unsigned DEFAULT NULL,
  `ville` varchar(255) DEFAULT NULL,
  `pays` varchar(64) DEFAULT NULL,
  `dateRelance` datetime DEFAULT NULL,
  `dateEntretien` datetime DEFAULT NULL,
  `nomContact` varchar(255) DEFAULT NULL,
  `emailContact` varchar(128) DEFAULT NULL,
  `telContact` varchar(24) DEFAULT NULL,
  `urlSource` text,
  `note` text,
  `archived` tinyint(4) NOT NULL DEFAULT '0',
  `type` tinyint(4) NOT NULL DEFAULT '0',
  `rating` tinyint(4) NOT NULL DEFAULT '0',
  `sourceId` varchar(45) DEFAULT NULL,
  `expired` tinyint(4) unsigned DEFAULT '0',
  `creationDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `logoUrl` varchar(255) DEFAULT NULL,
  `jobBoard` varchar(45) DEFAULT NULL,
  `isButton` tinyint(1) DEFAULT '0',
  `numSiret` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `jobBoard` (`jobBoard`),
  KEY `typeIdx` (`type`),
  KEY `etatIdx` (`etat`),
  KEY `numSiretIdx` (`numSiret`),
  KEY `sourceIdIdx` (`sourceId`),
  CONSTRAINT `userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3881973 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `candidaturesID`
--

DROP TABLE IF EXISTS `candidaturesID`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `candidaturesID` (
  `id` bigint(20) unsigned NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fakeUsers`
--

DROP TABLE IF EXISTS `fakeUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fakeUsers` (
  `userId` bigint(20) NOT NULL,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mailingAddresses`
--

DROP TABLE IF EXISTS `mailingAddresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mailingAddresses` (
  `login` varchar(128) NOT NULL,
  PRIMARY KEY (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mailingAdresses`
--

DROP TABLE IF EXISTS `mailingAdresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mailingAdresses` (
  `login` varchar(128) NOT NULL,
  PRIMARY KEY (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `statsUsersAssidus_m`
--

DROP TABLE IF EXISTS `statsUsersAssidus_m`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `statsUsersAssidus_m` (
  `mois` varchar(5) CHARACTER SET utf8 DEFAULT NULL,
  `compt` bigint(21) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `statsUsersEntretien_m`
--

DROP TABLE IF EXISTS `statsUsersEntretien_m`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `statsUsersEntretien_m` (
  `mois` varchar(5) CHARACTER SET utf8 DEFAULT NULL,
  `compt` bigint(21) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `statsUsersRetourEmploi_m`
--

DROP TABLE IF EXISTS `statsUsersRetourEmploi_m`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `statsUsersRetourEmploi_m` (
  `mois` varchar(5) CHARACTER SET utf8 DEFAULT NULL,
  `compt` bigint(21) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userActivities_m`
--

DROP TABLE IF EXISTS `userActivities_m`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userActivities_m` (
  `idUser` bigint(20) unsigned NOT NULL DEFAULT '0',
  `email` varchar(128) CHARACTER SET utf8 DEFAULT NULL,
  `receiveEmail` tinyint(4) DEFAULT '1',
  `dateCreation` datetime NOT NULL,
  `cohorte` tinyint(4) DEFAULT '3',
  `todo` bigint(21) DEFAULT NULL,
  `cand` bigint(21) DEFAULT NULL,
  `rela` bigint(21) DEFAULT NULL,
  `entr` bigint(21) DEFAULT NULL,
  `conn` bigint(21) DEFAULT NULL,
  `fbConn` bigint(21) DEFAULT NULL,
  `lastActivity` datetime DEFAULT NULL,
  `connAssMonth` bigint(21) DEFAULT NULL,
  `actAssMonth` bigint(21) DEFAULT NULL,
  `connAssTrim` bigint(21) DEFAULT NULL,
  `actAssTrim` bigint(21) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userCohorts`
--

DROP TABLE IF EXISTS `userCohorts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userCohorts` (
  `userId` bigint(20) unsigned NOT NULL,
  `cohort` tinyint(3) unsigned DEFAULT NULL,
  `creationTime` datetime DEFAULT NULL,
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `userIdIdx` (`userId`),
  KEY `cohortIdx` (`cohort`),
  CONSTRAINT `userIdFK` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userLogs`
--

DROP TABLE IF EXISTS `userLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userLogs` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) unsigned NOT NULL,
  `domaine` varchar(30) DEFAULT NULL,
  `action` varchar(30) DEFAULT NULL,
  `candidatureId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `creationTime` datetime DEFAULT NULL,
  `source` varchar(20) DEFAULT NULL,
  `campagne` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `action` (`action`),
  KEY `domaine` (`domaine`),
  KEY `creationTime` (`creationTime`)
) ENGINE=InnoDB AUTO_INCREMENT=20607093 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `userROMEs`
--

DROP TABLE IF EXISTS `userROMEs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `userROMEs` (
  `userId` bigint(20) unsigned NOT NULL,
  `ROME` varchar(5) NOT NULL,
  UNIQUE KEY `userIDROMEUnique` (`userId`,`ROME`),
  KEY `userIdIdx` (`userId`),
  KEY `ROMEIdx` (`ROME`),
  CONSTRAINT `FK_userId_id` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `login` varchar(128) DEFAULT NULL,
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `facebookId` bigint(20) unsigned DEFAULT NULL,
  `validationCode` varchar(36) DEFAULT NULL,
  `creationTime` datetime NOT NULL,
  `validated` tinyint(1) NOT NULL DEFAULT '0',
  `receiveNotification` tinyint(4) DEFAULT '1',
  `cohorte` tinyint(4) DEFAULT '3',
  `newPassword` tinytext,
  `lastPasswordChange` datetime DEFAULT CURRENT_TIMESTAMP,
  `changePasswordToken` tinytext,
  `source` varchar(80) DEFAULT NULL,
  `autoDisableNotification` tinyint(1) DEFAULT '0',
  `peEmail` varchar(60) DEFAULT NULL,
  `peId` varchar(100) DEFAULT NULL,
  `lastName` varchar(85) DEFAULT NULL,
  `firstName` varchar(30) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `zip` varchar(5) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `cityInsee` varchar(5) DEFAULT NULL,
  `toDelete` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `cohorteIdx` (`cohorte`),
  KEY `sourceIdx` (`source`),
  KEY `loginIdx` (`login`),
  KEY `peIdIdx` (`peId`)
) ENGINE=InnoDB AUTO_INCREMENT=475507 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `utilisateursAssidus`
--

DROP TABLE IF EXISTS `utilisateursAssidus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `utilisateursAssidus` (
  `userId` bigint(20) NOT NULL,
  `month` datetime NOT NULL,
  KEY `userIdIdx` (`userId`),
  KEY `monthIdx` (`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'motivaction'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `create_statsUsersAssidus_m` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8 */ ;;
/*!50003 SET character_set_results = utf8 */ ;;
/*!50003 SET collation_connection  = utf8_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = '' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root_memo`@`%`*/ /*!50106 EVENT `create_statsUsersAssidus_m` ON SCHEDULE EVERY 1 DAY STARTS '2018-11-07 02:01:00' ON COMPLETION NOT PRESERVE ENABLE DO CREATE TABLE statsUsersAssidus_m AS 
		SELECT vueConnexions.mois, COUNT(vueConnexions.userId) as compt FROM 
			(SELECT ul.userId, DATE_FORMAT(ul.creationTime, '%m/%y') as mois, count(1) FROM userLogs ul
				INNER JOIN users u 
				ON ul.userId = u.id 
	        	WHERE u.login NOT LIKE '%@pole-emploi.fr' 
				AND ul.action LIKE 'Connexion%'   
				AND YEAR(ul.creationTime) >= 2017
				GROUP BY ul.userId,DATE_FORMAT(ul.creationTime, '%m/%y') 
				HAVING COUNT(1) >= 4) vueConnexions 
			INNER JOIN 
			(SELECT userId, DATE_FORMAT(creationTime, '%m/%y') as mois ,count(1) FROM userLogs  
				WHERE YEAR(creationTime) >= 2017
				GROUP BY userId,DATE_FORMAT(creationTime, '%m/%y') 
				HAVING COUNT(1) >= 8) vueActivites 
			ON vueConnexions.userId=vueActivites.userId 
			AND vueConnexions.mois=vueActivites.mois 
			GROUP BY vueConnexions.mois
			ORDER BY STR_TO_DATE(CONCAT(vueConnexions.mois, '/01'), "%m/%y/%d") */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `create_statsUsersEntretien_m` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8 */ ;;
/*!50003 SET character_set_results = utf8 */ ;;
/*!50003 SET collation_connection  = utf8_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = '' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root_memo`@`%`*/ /*!50106 EVENT `create_statsUsersEntretien_m` ON SCHEDULE EVERY 1 DAY STARTS '2019-01-03 02:02:00' ON COMPLETION NOT PRESERVE DISABLE ON SLAVE DO CREATE TABLE statsUsersEntretien_m AS 
		SELECT vueEntretien.mois, COUNT(vueConnexions.userId) as compt FROM  
			(SELECT userId, count(1) from userLogs ul  
				INNER JOIN users u  
				ON ul.userId = u.id  
        		WHERE u.login NOT LIKE '%@pole-emploi.fr'  
				AND ul.action LIKE 'Connexion%'   
				GROUP BY ul.userId   
				HAVING COUNT(1) >= 4) vueConnexions   
			INNER JOIN   
			(SELECT userId, count(1) FROM userLogs   
				GROUP BY userId  
				HAVING COUNT(1) >= 8) vueActivites   
			ON vueConnexions.userId=vueActivites.userId   
			INNER JOIN   
			(SELECT userId, DATE_FORMAT(creationTime, '%m/%y') as mois FROM candidatures c   
				INNER JOIN candidatureEvents cE   
				ON c.id = cE.candidatureId   
				WHERE cE.eventType = 3  
				AND YEAR(creationTime) >= 2017  
				AND creationTime < DATE(DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-01'))    # ajout d un mois pour avoir le mois courant
				GROUP BY userId, DATE_FORMAT(creationTime, '%m/%y')) vueEntretien   
			ON vueEntretien.userId = vueActivites.userId  
			GROUP BY vueEntretien.mois
			ORDER BY STR_TO_DATE(CONCAT(vueEntretien.mois, '/01'), "%m/%y/%d") */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `create_statsUsersRetourEmploi_m` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8 */ ;;
/*!50003 SET character_set_results = utf8 */ ;;
/*!50003 SET collation_connection  = utf8_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = '' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root_memo`@`%`*/ /*!50106 EVENT `create_statsUsersRetourEmploi_m` ON SCHEDULE EVERY 1 DAY STARTS '2018-11-07 02:03:00' ON COMPLETION NOT PRESERVE ENABLE DO CREATE TABLE statsUsersRetourEmploi_m AS 
		SELECT vueSRE.mois, COUNT(vueConnexions.userId) as compt FROM 
			(SELECT userId, count(1) FROM userLogs ul  
				INNER JOIN users u 
				ON ul.userId = u.id 
				WHERE u.login NOT LIKE '%@pole-emploi.fr' 
				AND ul.action LIKE 'Connexion%' 
				GROUP BY userId 
				HAVING COUNT(1) >= 4) vueConnexions  
			INNER JOIN 
			(SELECT userId, count(1) FROM userLogs 
				GROUP BY userId 
				HAVING COUNT(1) >= 8) vueActivites  
			ON vueConnexions.userId=vueActivites.userId 
			INNER JOIN 
			(SELECT userId, DATE_FORMAT(creationTime, '%m/%y') as mois FROM candidatures c  
				INNER JOIN candidatureEvents cE ON c.id = cE.candidatureId 
				WHERE (cE.eventSubType = 9 
				OR cE.eventSubType = 10) 
				AND YEAR(cE.creationTime) >= 2017 
				AND cE.creationTime < DATE(DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')) # ajout d un mois pour avoir le mois courant
				GROUP BY userId, mois) vueSRE 
			ON vueSRE.userId = vueConnexions.userId 
			GROUP BY vueSRE.mois
			ORDER BY STR_TO_DATE(CONCAT(vueSRE.mois, '/01'), "%m/%y/%d") */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `create_userActivities_m` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8 */ ;;
/*!50003 SET character_set_results = utf8 */ ;;
/*!50003 SET collation_connection  = utf8_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = '' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root_memo`@`%`*/ /*!50106 EVENT `create_userActivities_m` ON SCHEDULE EVERY 1 DAY STARTS '2018-11-07 01:00:30' ON COMPLETION NOT PRESERVE DISABLE DO CREATE TABLE userActivities_m AS 
		SELECT users.id AS idUser, 
			users.login AS email, 
			users.receiveNotification AS receiveEmail,
			users.creationTime AS dateCreation,
			users.cohorte AS cohorte,
			(SELECT COUNT(*) FROM candidatures WHERE candidatures.etat=0 AND candidatures.userId = idUser) AS todo, 
			(SELECT COUNT(*) FROM candidatures WHERE candidatures.etat=1 AND candidatures.userId = idUser) as cand, 
			(SELECT COUNT(*) FROM candidatures WHERE candidatures.etat=2 AND candidatures.userId = idUser) as rela, 
			(SELECT COUNT(*) FROM candidatures WHERE candidatures.etat=3 AND candidatures.userId = idUser) as entr, 
			(SELECT COUNT(*) FROM userLogs WHERE userLogs.action like 'Connexion%' AND userLogs.userId = idUser) as conn, 
			(SELECT COUNT(*) FROM userLogs WHERE userLogs.action like '% Facebook' AND userLogs.userId = idUser) as fbConn, 
			(SELECT MAX(creationTime) FROM userLogs WHERE userLogs.userId = idUser) as lastActivity,
			(SELECT count(1) from userLogs WHERE action LIKE 'Connexion%' AND userLogs.userId = idUser AND creationTime > DATE_SUB(NOW(), INTERVAL 30 DAY)) as connAssMonth, 
			(SELECT count(1) from userLogs WHERE userLogs.userId = idUser AND creationTime > DATE_SUB(NOW(), INTERVAL 30 DAY)) as actAssMonth, 
			(SELECT count(1) from userLogs WHERE action LIKE 'Connexion%' AND userLogs.userId = idUser AND creationTime > DATE_SUB(NOW(), INTERVAL 90 DAY)) as connAssTrim, 
			(SELECT count(1) from userLogs WHERE userLogs.userId = userId AND creationTime > DATE_SUB(NOW(), INTERVAL 90 DAY)) as actAssTrim 
		FROM users WHERE users.id  NOT IN (SELECT userId FROM fakeUsers)  
        GROUP BY users.id, users.login 
        ORDER BY lastActivity desc */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `drop_statsUsersAssidus_m` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8 */ ;;
/*!50003 SET character_set_results = utf8 */ ;;
/*!50003 SET collation_connection  = utf8_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = '' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root_memo`@`%`*/ /*!50106 EVENT `drop_statsUsersAssidus_m` ON SCHEDULE EVERY 1 DAY STARTS '2018-11-07 02:00:00' ON COMPLETION NOT PRESERVE ENABLE DO DROP TABLE IF EXISTS statsUsersAssidus_m */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `drop_statsUsersEntretien_m` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8 */ ;;
/*!50003 SET character_set_results = utf8 */ ;;
/*!50003 SET collation_connection  = utf8_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = '' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root_memo`@`%`*/ /*!50106 EVENT `drop_statsUsersEntretien_m` ON SCHEDULE EVERY 1 DAY STARTS '2018-11-07 02:00:00' ON COMPLETION NOT PRESERVE ENABLE DO DROP TABLE IF EXISTS statsUsersEntretien_m */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `drop_statsUsersRetourEmploi_m` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8 */ ;;
/*!50003 SET character_set_results = utf8 */ ;;
/*!50003 SET collation_connection  = utf8_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = '' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root_memo`@`%`*/ /*!50106 EVENT `drop_statsUsersRetourEmploi_m` ON SCHEDULE EVERY 1 DAY STARTS '2018-11-07 02:00:00' ON COMPLETION NOT PRESERVE ENABLE DO DROP TABLE IF EXISTS statsUsersRetourEmploi_m */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
/*!50106 DROP EVENT IF EXISTS `drop_userActivities_m` */;;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8 */ ;;
/*!50003 SET character_set_results = utf8 */ ;;
/*!50003 SET collation_connection  = utf8_general_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = '' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`root_memo`@`%`*/ /*!50106 EVENT `drop_userActivities_m` ON SCHEDULE EVERY 1 DAY STARTS '2018-11-07 01:00:00' ON COMPLETION NOT PRESERVE DISABLE DO DROP TABLE IF EXISTS userActivities_m */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-01-17 11:28:33
