package fr.gouv.motivaction.service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeMap;

import fr.gouv.motivaction.model.NbCandidatureReseauValue;
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

    public static String getNbCandidatureReseau() throws Exception
    {
        String json = "{";
        String labels = "\"labels\" : [";
        String serie1 = "[";
        String serie2_3 = "[";
        String serie4_5 = "[";
        String serie6 = "[";
        NbCandidatureReseauValue val;
        DateTimeFormatter ft = DateTimeFormatter.ofPattern("MM/yy");

        ArrayList vals = StatsDAO.getNbCandidatureReseau();

        for(int i=0; i<vals.size(); ++i)
        {
            if(i>0)
            {
                labels+=",";
                serie1+=",";
                serie2_3+=",";
                serie4_5+=",";
                serie6+=",";
            }

            val = (NbCandidatureReseauValue)vals.get(i);
            Timestamp ts = val.getPeriode();
            LocalDateTime dt = ts.toLocalDateTime();
            labels+="\""+dt.format(ft)+"\"";

            serie1+="{ \"meta\" : \"1 carte\", \"value\" : "+val.getNbCarte1()+"}";
            serie2_3+="{ \"meta\" : \"2-3 cartes\", \"value\" : "+val.getNbCarte2_3()+"}";
            serie4_5+="{ \"meta\" : \"4-5 cartes\", \"value\" : "+val.getNbCarte4_5()+"}";
            serie6+="{ \"meta\" : \"6 cartes et plus\", \"value\" : "+val.getNbCarte6()+"}";

        }

        labels+="]";
        serie1+="]";
        serie2_3+="]";
        serie4_5+="]";
        serie6+="]";

        json += labels+", \"series\" :  ["+serie1+","+serie2_3+","+serie4_5+","+serie6+"] }";

        return json;
    }
}
