package fr.gouv.motivaction.exception;

import org.apache.log4j.Logger;

public class EmailLoginException extends Exception {
	private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "040";
    
    public EmailLoginException() {
    	super("l'adresse électronique doit être non vide et valide pour MEMO");
    }
}
