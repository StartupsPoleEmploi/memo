
# MEMO


# Présentation du projet

Suivez l'ensemble de vos candidatures en un seul endroit et boostez leur potentiel !

Vous postulez à plusieurs endroits et avez du mal à vous souvenir de tout ?
Vous attendez trop souvent une réponse à vos candidatures sans engager de nouvelles actions ?
Memo est le premier service en ligne qui permet de suivre l'ensemble de ses candidatures et de booster leur potentiel !

Enregistrez en un clic les offres d'emploi depuis tous les sites, ainsi que vos candidatures spontanées et celles auprès de votre réseau relationnel, vous les retrouverez alors sur un véritable tableau de bord interactif !
Memo vous dit ce qu'il faut faire au bon moment et comment s'y prendre. Vos candidatures se démarquent alors positivement auprès des recruteurs ! Décrochez plus vite un job en vous simplifiant la vie : adoptez Memo !

# Project overview

Follow all your applications in one place and boost their potential!

Are you applying in more than one place and have trouble remembering everything?
Do you wait too often for a response to your applications without taking new actions?
Memo is the first online service to track all applications and bolster their potential!

Register one-click job offers from all sites, as well as your unsolicited applications and those from your relational network, you will find them on a real interactive dashboard!
Memo tells you what to do at the right time and how to do it. Your applications will then stand out positively with recruiters! Get a job faster by simplifying your life: try Memo!

# Development

## Install

Clone memo repository:

    $ git clone https://github.com/StartupsPoleEmploi/memo.git

Create a mariadb, nginx, tomcat8, postfix environment

TODO: docker

Start required services 

TODO: docker

Create database:

TODO: docker


The app is available on port `80` on host machine. Open a web browser, load
http://localhost and start browsing.

## Configuration

Modify mandatory values in .properties files in /src/fr/gouv/motivaction/properties/*

- secret.properties : 
    salt = a random alphanumeric value 
    encryptorSecret = a random alphanumeric value
    pwdSql = a string containing two question mark '?' characters
   

- mail.properties :

    email.noReply = your sending email address
    email.noReplyExt = your sending email address
    email.personal = your sending email name
 
 
## Accessing your local MySQL

To access your local MySQL in your MySQL GUI :

- new connection / select "SSH" tab
- MySQL host: 127.0.0.1:3306
- Username: root
- Password: leave empty
- Database: motivaction

