package fr.gouv.motivaction.exception;

import org.apache.log4j.Logger;

public class OffreExpiredException extends Exception {
	private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "035";
    
    public OffreExpiredException() {
    	super("Offre expirée");
    }
}
