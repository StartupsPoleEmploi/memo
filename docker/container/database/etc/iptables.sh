conf_iptables()
{
	#D'abord une petite doc pour aider:
	#- Pour lister les règles en détail: iptables -L -v -n
	#- Supprimer une règle: voir d'abord les lignes avec iptables -L --line-numbers, puis supprimer la ligne en précisant la chaine, par ex: iptables -D OUTPUT numéro_de_ligne
	#- Sauver les règles: iptables-save -c >fichier.txt
	#- Restorer des règles sauvées: iptables-restore <fichier.txt
	#- Changement de policy avec iptables -P <INPUT/OUTPUT/FORWARD> <ACCEPT/DROP> (Qui définit le comportement par défaut, DROP tout ou ACCEPT tout pour telle ou telle chaine)
	#- iptables -A <INPUT/OUTPUT/FORWARD> ... : ajoute une règle à une chaine
	
	# Avant de flusher la table INPUT, il faut mettre la policy à ACCEPT pr ne pas perdre la connexion
	iptables -P INPUT ACCEPT;
	iptables -P FORWARD ACCEPT;
	iptables -P OUTPUT ACCEPT;
	
	# flush de toutes les tables
	iptables -F; 
	
	#Pour permettre une connexion déjà ouverte de recevoir du trafic (histoire de ne pas perturber les connexions en cours)
	iptables -A INPUT -m conntrack --ctstate ESTABLISHED -j ACCEPT;
	
	#On autorise tout le trafic web
	iptables -A INPUT -p tcp -i eth0 --dport 80 -j ACCEPT;  #HTTP
	iptables -A INPUT -p tcp -i eth0 --dport 443 -j ACCEPT; #HTTPS
	
	iptables -A INPUT -p tcp -s 172.0.0.0/16 -j ACCEPT;     #DOCKER du réseau local docker

	echo "IPTABLES du fichier de conf .env : ";
	echo $IPTABLES;
	eval $IPTABLES;
 	
	#On autorise le trafic local car le DROP (policy) un peu plus loin va tout bloquer en entrant
	iptables -I INPUT 2 -i lo -j ACCEPT;
	
	#On autorise les ping entrants
	iptables -A INPUT -p icmp -j ACCEPT;
	
	#On bloque tout le reste en entrant (changement de policy INPUT)
	iptables -P INPUT DROP;

	#Sauvegarde des règles et création du script de restauration au démarrage de l'interface réseau
	iptables-save >/etc/iptables-save;
	echo -e "#!/bin/sh\niptables-restore </etc/iptables-save" >/etc/network/if-up.d/firewall;
	chmod u+rwx /etc/network/if-up.d/firewall;

	echo "SET IPTABLES";
}
conf_iptables;
