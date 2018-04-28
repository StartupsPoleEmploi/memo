package fr.gouv.motivaction.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeMap;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.Constantes.JobBoard;
import fr.gouv.motivaction.dao.StatsDAO;
import fr.gouv.motivaction.model.Stat;


/**
 * Created by JR on 03/05/2016.
 */
public class StatsService {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "030";

    public static ArrayList<Stat> getUtilisateursAssidus() throws Exception
    {
        return StatsDAO.getUtilisateursAssidus();
    }
    
    public static ArrayList<Stat> getUtilisateursEntretien() throws Exception
    {
        return StatsDAO.getUtilisateursEntretien();
    }
    
    public static ArrayList<Stat> getUtilisateursRetourEmploi() throws Exception
    {
        return StatsDAO.getUtilisateursRetourEmploi();
    }
    
    public static ArrayList<Stat> getIncomingUsersFromSource(JobBoard jobBoard) throws Exception
    {
        return StatsDAO.getIncomingUsersFromSource((jobBoard!=null)?jobBoard.getNom():null);
    }
    
    public static ArrayList<Stat> getIncomingCandidaturesFromSource(JobBoard jobBoard) throws Exception
    {
        return StatsDAO.getIncomingCandidaturesFromSource((jobBoard!=null)?jobBoard.getLibelle():null);
    }
    
    public static ArrayList<Stat> getIncomingCandidaturesFromButton(JobBoard jobBoard) throws Exception
    {
        return StatsDAO.getIncomingCandidaturesFromButton(jobBoard.getLibelle());
    }
    
    public static HashMap getTypeCandidature() throws Exception
    {
        return StatsDAO.getTypeCandidature();
    }
}
