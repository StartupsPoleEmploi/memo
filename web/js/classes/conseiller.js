function Conseiller(){
	this.init();
}

Conseiller.prototype = {
		
		init : function()
	    {
	        var t=this;    
	        
	        t.initGA();
	        t.rootURL = window.location.protocol+"//"+window.location.hostname;
	        t.rootURL += "/rest";
	        
	        $("#goToEspaceDemandeur").on("click",$.proxy( t.searchUserByEmail, t));
	        $("#sendInvitationToUseMemo").on("click",$.proxy(t.sendInvitationToUseMemo, t));
	    },
        
	    // Global site tag (gtag.js) - Google Analytics
	    initGA : function() {
    	    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    	        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    	    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    		})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    		ga('create', 'UA-77025427-1', 'auto');
	    },
        
	    // vérification du format d'email
        checkEmail :function(email)
        {
            var filter  = /^(")?(?:[^\."])(?:(?:[\.])?(?:[\w\-!#$%&'*+/=?^_`{|}~]))*\1@(\w[\-\w]*\.){1,5}([A-Za-z]){2,6}$/;
            return filter.test(email);
        },
        
        // recherche de l'utilisateur à partir de l'email saisi par le conseiller
	    searchUserByEmail : function()
        {
	    	var t =this;       	 
	    	var email = $("#email").val();

	    	if(t.checkEmail(email)) {
	    		$.ajax({
	    			type: 'GET',
	    			url: t.rootURL + '/conseiller/user/'+email,
	    			dataType: "json",

	    			success: function (response) {
	    				if(response.result=="ok") {
	    					if(response.consentAccess == 1) {
	    						// l'utilisateur a consenti à donner l'accès à son TDB par son conseiller
	    						if (response.visitorLink) {
	    							// le lien d'accès a été généré donc le conseiller est redirigé vers le TDB en consultation
	    							window.location.replace(window.location.origin+"?linkConseiller="+response.visitorLink);
	    						}
	    					}
	    					else {
	    						// L'utilisateur n'a pas consenti 
	    						if(response.lastAccessRefuserDate) {
	    							// l'utilisateur a déjà refusé une demande d'acces à son TDB de part son conseiller
	    							window.location.replace(window.location.origin+"/jsp/pages/conseiller/rejectedAccessConseiller.jsp?email="+email);
	    						}
	    						else {                        			 
	    							// le conseiller peut effectuer une demande d'accès au TDB
	    							window.location.replace(window.location.origin+"/jsp/pages/conseiller/noGrantedAccessConseiller.jsp?email="+email); 	 
	    						}            		 
	    					}                         	
	    				}  
	    				else {
	    					$('.notEmail').show();
	    					$('#formatEmail').hide();
	    				}     
	    			},
	    			error: function (jqXHR, textStatus, errorThrown) {
	    				console.log('/conseiller error: ' + textStatus);
	    			}
	    		});
	    	}
	    	else{
	    		t.displayEmailInvalide();
	    	}   
        },
        
        // Affiche la date de la derniere demande d'accès et la date de refus
        getDateRefusAccess : function(email)
        {
        	var t =this;    
        	
        	$.ajax({
	            type: 'GET',
	            url: t.rootURL + '/conseiller/getDatesRefusAccess/'+email,
	            dataType: "json",
	
	            success: function (response)
	            {	            	 
	                if(response.result=="ok") {
	                	if (response.lastAccessRequestDate) {
	                		$("#dateAcces").html(response.lastAccessRequestDate);
	                		$("#txtDateAccess").show();
	                	}
	                	if (response.lastAccessRefuserDate) {
		                	$("#dateRefus").html(response.lastAccessRefuserDate);
		                	$("#txtDateRefus").show();
	                	}
	                }
	                else {
	                	console.log("lastAccessRequestDate error !");
	                }
	            },
	            error: function (jqXHR, textStatus, errorThrown)
	            {
	                console.log('/conseiller error: ' + textStatus);              
	            }
	        });	
        },
        
        goToHomePage : function()
        {
        	window.location.replace(window.location.origin+"/conseiller");
        },
        
        goToInvitPage : function()
        {
        	var email = $("#email").val();
			window.location.replace(window.location.origin+"/jsp/pages/conseiller/sendInvitationConseiller.jsp?email="+email);
        },
        
        logEventToGA : function(hitType, evtCategory, evtAction, evtLabel) {
        	ga('send', {
                hitType: hitType,
                eventCategory: evtCategory,
                eventAction: evtAction,
                eventLabel: evtLabel
            });
        },
                
        // envoi un mail au demandeur pour qu'il rejoigne MEMO 
        sendInvitationToUseMemo : function()
        {
        	var t =this;      
        	var	email = $("#envEmail").val(); 	 
        	 
        	 if(t.checkEmail(email))
        	 {
        		 $.ajax({
        			 type: 'GET',
        			 url: this.rootURL + '/conseiller/sendInvitationToUseMemo/'+email,
        			 dataType: "json",

        			 success: function (response) {

        				 if(response.result=="ok")
        				 {
        					 t.logEventToGA('event', 'Conseiller', 'Invitation rejoindre Memo', '');
        					 window.location.replace(window.location.origin+"/jsp/pages/conseiller/validateSendingConseiller.jsp?type=1&msg=Votre invitation a bien été envoyée");
        				 } 
        				 else if (response.result=="user"){
        					 window.location.replace(window.location.origin+"/jsp/pages/conseiller/validateSendingConseiller.jsp?type=1&msg="+email+" a déjà un compte MEMO. <br>Vous pouvez tenter d'accéder directement à son tableau de bord.");
        				 }
        				 else
        				 {
        					 window.location.replace(window.location.origin+"/jsp/pages/conseiller/validateSendingConseiller.jsp?type=0&msg=Un problème est survenu lors de l'envoi de votre demande. Veuillez renouveler votre demande et si le problème persiste contactez le support technique.");
        				 }    
        			 },
        			 error: function (jqXHR, textStatus, errorThrown) {
        				 console.log('/conseiller error: ' + textStatus);
        				 window.location.replace(window.location.origin+"/jsp/pages/conseiller/validateSendingConseiller.jsp?type=0&msg=Un problème est survenu lors de l'envoi de votre demande. Veuillez renouveler votre demande et si le problème persiste contactez le support technique.");
        			 }
        		 });
        	 }
        	 else{
        		 t.displayEmailInvalide();
        	 }
        		
        },
        
        // Affiche le message d'erreur d'un email invalide
        displayEmailInvalide : function () {
        	$('.email').show();
   		 	document.getElementById("formatEmail").style.display = "block" ;
   		 	$('.notEmail').hide();
   		 	$("#formatEmail").html("Veuillez renseigner une adresse e-mail valide");
        },
        
        // Envoie un mail au demandeur pour qu'il donne acces à son TDB à son conseiller et met à jour en BDD la date d'envoi 
        sendRequestToAccessTDB : function()
        {
        	var t = this;      
        	var url = new URL(window.location.href),
        	//récupération d'email depuis l'url 
        	email = url.searchParams.get("email");
        		       	 
        	if(t.checkEmail(email)) {
        		$.ajax({
        			type: 'POST',
        			url: this.rootURL + '/conseiller/sendRequestToAccessTDB/'+email,
        			dataType: "json",

        			success: function (response) {
        				if(response.result=="ok") {
        					t.logEventToGA('event', 'Conseiller', 'Demande d accès TDB', '');
        					window.location.replace(window.location.origin+"/jsp/pages/conseiller/validateSendingConseiller.jsp?msg=Votre demande d'accès à l'espace MEMO de cet utilisateur <br> a bien été envoyée.");
        				}
        				else {
        					window.location.replace(window.location.origin+"/jsp/pages/conseiller/validateSendingConseiller.jsp?msg=Un problème est survenu lors de l'envoi de votre demande. Veuillez renouveler votre demande et si le problème persiste contactez le support technique.");
        				}    
        			},
        			error: function (jqXHR, textStatus, errorThrown) {
        				console.log('/conseiller error: ' + textStatus);
        				window.location.replace(window.location.origin+"/jsp/pages/conseiller/validateSendingConseiller.jsp?msg=Un problème est survenu lors de l'envoi de votre demande. Veuillez renouveler votre demande et si le problème persiste contactez le support technique.");
        			}
        		});
        	}
        	else{
        		console.log("Email not valid !! ");
        	}   	
        }       
}  		
