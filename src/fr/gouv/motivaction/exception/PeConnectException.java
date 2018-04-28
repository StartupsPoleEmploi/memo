package fr.gouv.motivaction.exception;

import org.apache.log4j.Logger;

public class PeConnectException extends Exception {
	private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "040";
    
    public PeConnectException() {
    	super("Votre adresse électronique doit être valide pour MEMO");
    }
}
