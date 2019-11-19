package fr.gouv.motivaction.exception;

import org.apache.log4j.Logger;

public class LaBonneBoiteAPIException extends Exception {
	private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "052";
    
    public LaBonneBoiteAPIException(String msg) {
    	super(msg);
    }
}
