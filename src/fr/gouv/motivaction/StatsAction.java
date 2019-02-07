package fr.gouv.motivaction;

import java.util.*;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;

import fr.gouv.motivaction.Constantes.JobBoard;
import fr.gouv.motivaction.model.Stat;
import fr.gouv.motivaction.service.StatsService;
import fr.gouv.motivaction.utils.Utils;


@Path("/stats")
public class StatsAction {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "029";

    /**
     *
     * @param servletRequest
     * @return Nombre d'utilisateurs qui ont eu au moins 4 connexions et 8 interactions (créer une candidature, faire avancer une candidature, etc) dans le mois.
     */
    @GET
    @Path("utilisateursAssidus")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUsersAssidus(@Context HttpServletRequest servletRequest)
    {
        String res;
        try
        {
            ArrayList<Stat> listUserCount = StatsService.getUtilisateursAssidus();
            String[] tabStringJSON = getStringTabKeysValuesForJSON(listUserCount);

            res = "{ \"result\" : \"ok\", \"tabKeys\" : " + tabStringJSON[0] + ", \"tabValues\" : [" + tabStringJSON[1] + "]  }";

        }
        catch (Exception e)
        {
            log.error(logCode + "-001 Error getting user count. error=" + e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }

    /**
     *
     * @param servletRequest
     * @return Nombre d'utilisateurs qui ont décroché au moins un entretien en ayant été "assidu" à un moment donné  (pas forcément dans les 30 derniers jours).
     */
    @GET
    @Path("utilisateursEntretien")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUsersEntretien(@Context HttpServletRequest servletRequest)
    {
        String res;
        try
        {
            ArrayList<Stat> lstStat = StatsService.getUtilisateursEntretien();
            String[] tabStringJSON = getStringTabKeysValuesForJSON(lstStat);

            res = "{ \"result\" : \"ok\", \"tabKeys\" : " + tabStringJSON[0] + ", \"tabValues\" : [" + tabStringJSON[1] + "]  }";

        }
        catch (Exception e)
        {
            log.error(logCode + "-002 Error getting user interview count. error=" + e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }

    /**
     *
     * @param servletRequest
     * @return Nombre d'utilisateurs qui ont déclaré dans MEMO avoir décroché un job
     */
    @GET
    @Path("utilisateursRetourEmploi")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getUsersWithEmploi(@Context HttpServletRequest servletRequest)
    {
        String res;
        try
        {
            ArrayList<Stat> lstStat = StatsService.getUtilisateursRetourEmploi();
            String[] tabStringJSON = getStringTabKeysValuesForJSON(lstStat);

            res = "{ \"result\" : \"ok\", \"tabKeys\" : " + tabStringJSON[0] + ", \"tabValues\" : [" + tabStringJSON[1] + "]  }";

        }
        catch (Exception e)
        {
            log.error(logCode + "-003 Error getting user with job count. error=" + e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }

    /**
     * @param servletRequest
     * @return Nombre de comptes crées en provenance de l'extérieur
     */
    @GET
    @Path("utilisateursEntrants")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getIncomingUsers(@Context HttpServletRequest servletRequest)
    {
        String res;
        Set<String> setKeysJSON = null;
        ArrayList<Stat> lstStat = null;
        try
        {
            ArrayList<Stat> lstStatLBB = StatsService.getIncomingUsersFromSource(JobBoard.LABONNEBOITE);
            ArrayList<Stat> lstStatPE = StatsService.getIncomingUsersFromSource(JobBoard.POLE_EMPLOI);
            ArrayList<Stat> lstStatES = StatsService.getIncomingUsersFromSource(JobBoard.EMPLOI_STORE);
            ArrayList<Stat> lstStatOther = StatsService.getIncomingUsersFromSource(null);

            lstStat = new ArrayList<Stat>(lstStatLBB);
            lstStat.addAll(lstStatPE);
            lstStat.addAll(lstStatES);
            lstStat.addAll(lstStatOther);
            // Tri des clés
            Collections.sort(lstStat);
            // fusion des clés
            setKeysJSON = Utils.getSetKeyFromStat(lstStat);

            // complétion des clés inexistantes par 0
            Utils.concatEmptyStat(lstStatLBB, setKeysJSON);
            // Tri car complétion des clés inexistantes en fin de liste
            Collections.sort(lstStatLBB);
            Utils.concatEmptyStat(lstStatPE, setKeysJSON);
            Collections.sort(lstStatPE);
            Utils.concatEmptyStat(lstStatES, setKeysJSON);
            Collections.sort(lstStatES);
            Utils.concatEmptyStat(lstStatOther, setKeysJSON);
            Collections.sort(lstStatOther);

            String[] tabStatLBB = this.getStringTabKeysValuesForJSON(lstStatLBB);
            String[] tabStatPE = this.getStringTabKeysValuesForJSON(lstStatPE);
            String[] tabStatES = this.getStringTabKeysValuesForJSON(lstStatES);
            String[] tabStatOther = this.getStringTabKeysValuesForJSON(lstStatOther);

            res = "{ \"result\" : \"ok\", \"tabKeys\" : " + this.getStringTabKeysForJSON(setKeysJSON) + ", \"tabValues\" : [" + tabStatPE[1] + ", " + tabStatLBB[1] + ", " + tabStatES[1]+ ", " + tabStatOther[1] + "]  }";
        }
        catch (Exception e)
        {
            log.error(logCode + "-004 Error getting user sources. error=" + e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }

    /**
     *
     * @param servletRequest
     * @return Nombre de candidatures importées en provenance de l'extérieur
     */
    @GET
    @Path("candidaturesEntrantes")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getIncomingCandidatures(@Context HttpServletRequest servletRequest)
    {
        String res;
        try
        {
            ArrayList<Stat> lstStatLBB = StatsService.getIncomingCandidaturesFromSource(JobBoard.LABONNEBOITE);
            ArrayList<Stat> lstStatPE = StatsService.getIncomingCandidaturesFromSource(JobBoard.POLE_EMPLOI);
            ArrayList<Stat> lstStatOther = StatsService.getIncomingCandidaturesFromSource(null);

            String[] tabStringPEJSON = this.getStringTabKeysValuesForJSON(lstStatPE);
            String[] tabStringLBBJSON = this.getStringTabKeysValuesForJSON(lstStatLBB);
            String[] tabStringOtherJSON = this.getStringTabKeysValuesForJSON(lstStatOther);

            res = "{ \"result\" : \"ok\", \"tabKeys\" : " + tabStringPEJSON[0] + ", \"tabValues\" : [" + tabStringPEJSON[1] + ", " + tabStringLBBJSON[1] + ", " + tabStringOtherJSON[1] + "]  }";
        }
        catch (Exception e)
        {
            log.error(logCode + "-005 Error getting application sources. error=" + e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }

    /**
     *
     * @param servletRequest
     * @return Nombre de candidatures importées en provenance de l'extérieur
     */
    @GET
    @Path("candidaturesButtonEntrantes")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getIncomingCandidaturesButton(@Context HttpServletRequest servletRequest)
    {
        String res;
        try
        {
            ArrayList<Stat> lstStatPE = StatsService.getIncomingCandidaturesFromButton(JobBoard.POLE_EMPLOI);
            ArrayList<Stat> lstStatLBB = StatsService.getIncomingCandidaturesFromButton(JobBoard.LABONNEBOITE);

            Set<String> setKeysJSON = null;

            String[] tabStringPEJSON = this.getStringTabKeysValuesForJSON(lstStatPE);
            String[] tabStringLBBJSON = this.getStringTabKeysValuesForJSON(lstStatLBB);

            res = "{ \"result\" : \"ok\", \"tabKeys\" : " + tabStringPEJSON[0] + ", \"tabValues\" : [" + tabStringPEJSON[1] + ", " + tabStringLBBJSON[1] + "]  }";
        }
        catch (Exception e)
        {
            log.error(logCode + "-006 Error getting import sources. error=" + e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }

    /**
     *
     * @param servletRequest
     * @return Nombre de candidature par type
     */
    @GET
    @Path("typeCandidature")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getTypeCandidature(@Context HttpServletRequest servletRequest)
    {
        String res;
        try
        {
            HashMap cartesParTypeParMois = StatsService.getTypeCandidature();

            ArrayList cartesSpont = (ArrayList)cartesParTypeParMois.get(1);
            ArrayList cartesOffre = (ArrayList)cartesParTypeParMois.get(2);
            ArrayList cartesReseau = (ArrayList)cartesParTypeParMois.get(3);
            ArrayList cartesAutres = (ArrayList)cartesParTypeParMois.get(4);

            String[] tabStringSpontJSON = this.prepareJSON(cartesSpont);
            String[] tabStringOffreJSON = this.prepareJSON(cartesOffre);
            String[] tabStringReseauJSON = this.prepareJSON(cartesReseau);
            String[] tabStringAutresJSON = this.prepareJSON(cartesAutres);

            res = "{ \"result\" : \"ok\", \"tabKeys\" : " + tabStringSpontJSON[0] + ", \"tabValues\" : [" + tabStringSpontJSON[1] + ", " + tabStringOffreJSON[1] + ", " + tabStringReseauJSON[1] + ", " + tabStringAutresJSON[1] + "] }";
        }
        catch (Exception e)
        {
            log.error(logCode + "-007 Error getting application types. error=" + e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }

    @GET
    @Path("nbCandidatureReseau")
    @Produces({ MediaType.APPLICATION_JSON })
    public String getNbCandidatureReseau(@Context HttpServletRequest servletRequest)
    {
        String res;
        try
        {
            String statJsonNbCandidatureReseau = StatsService.getNbCandidatureReseau();
            res = "{ \"result\" : \"ok\", \"values\" : " + statJsonNbCandidatureReseau + " }";
        }
        catch (Exception e)
        {
            log.error(logCode + "-008 Error getting application types. error=" + e);
            res = "{ \"result\" : \"error\", \"msg\" : \"systemError\" }";
        }

        return res;
    }


    private String[] prepareJSON(ArrayList<String[]> rawStat) {
        String[] tabResult = null;

        if (rawStat != null) {
            tabResult = new String[2];
            int i=0;
            tabResult[0] = "[";
            tabResult[1] = "[";
            for (String[] stat : rawStat) {
                if(i>0)
                {
                    tabResult[0]+=",";
                    tabResult[1]+=",";
                }
                tabResult[0]+="\"" + stat[0]+ "\"";
                tabResult[1]+="\"" + stat[1]+ "\"";
                i++;
            };
            tabResult[0] += "]";
            tabResult[1] += "]";
        }

        return tabResult;
    }

    private String[] getStringTabKeysValuesForJSON(ArrayList<Stat> lstStat) {
        String[] tabResult = null;

        if (lstStat != null) {

            tabResult = new String[2];
            int i=0;
            tabResult[0] = "[";
            tabResult[1] = "[";
            for (Stat stat : lstStat) {
                if(i>0)
                {
                    tabResult[0]+=",";
                    tabResult[1]+=",";
                }
                tabResult[0]+="\"" + stat.getCle()+ "\"";
                tabResult[1]+="\"" + stat.getValeur()+ "\"";
                i++;
            };
            tabResult[0] += "]";
            tabResult[1] += "]";
        }

        return tabResult;
    }

    private String getStringTabKeysForJSON(Set<String> set) {
        String result = null;

        if (set != null) {
            int i=0;
            result = "[";
            for (String key : set) {
                if(i>0)
                    result+=",";
                result+="\"" + key+ "\"";
                i++;
            };
            result+= "]";
        }
        return result;
    }

    private String getStringTabValuesForJSON(Collection<Long> lst) {
        String result = null;

        if (lst != null) {
            int i=0;
            result = "[";
            for (Long value : lst) {
                if(i>0)
                    result+=",";
                result+="\"" + value + "\"";
                i++;
            };
            result+= "]";
        }
        return result;
    }
}
