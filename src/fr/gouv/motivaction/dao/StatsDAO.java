package fr.gouv.motivaction.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.TreeMap;

import fr.gouv.motivaction.model.NbCandidatureReseauValue;
import org.apache.log4j.Logger;

import fr.gouv.motivaction.Constantes;
import fr.gouv.motivaction.model.Stat;
import fr.gouv.motivaction.utils.DatabaseManager;

/**
 * Created by JR on 03/05/2016.
 */
public class StatsDAO {

    private static final Logger log = Logger.getLogger("ctj");
    private static final String logCode = "031";

    /**
     * 
     * @return Retourne le nombre d'utilisateurs assidus par mois (au moins 4 connexions et 8 activités dans le mois), retrait des comptes agents pole-emploi
     * @throws Exception
     */
    public static ArrayList<Stat> getUtilisateursAssidus() throws Exception
    {
    	ArrayList<Stat> lstStat = new ArrayList<>();
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM statsUsersAssidus_m;";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next()) {
            	lstStat.add(new Stat(rs.getString("mois"), rs.getLong(2)));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-001 Error stats counting user activities. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "002");
        }

        return lstStat;
    }
    
    /**
     * 
     * @return Retourne le nombre d'utilisateurs assidus ayant décroché un entretien par mois, retrait des comptes agents pole-emploi
     * @throws Exception
     */
    public static ArrayList<Stat> getUtilisateursEntretien() throws Exception
    {
    	ArrayList<Stat> lstStat = new ArrayList<Stat>();
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM statsUsersEntretien_m;";
            
            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next()) {
            	lstStat.add(new Stat(rs.getString("mois"), rs.getLong(2)));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-003 Error stats counting user activities. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "004");
        }

        return lstStat;

    }
    
    /**
     * 
     * @return Retourne le nombre d'utilisateurs assidus ayant décroché un emploi par mois, , retrait des comptes agents pole-emploi
     * @throws Exception
     */
    public static ArrayList<Stat> getUtilisateursRetourEmploi() throws Exception
    {
    	ArrayList<Stat> lstStat = new ArrayList<Stat>();
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "SELECT * FROM statsUsersRetourEmploi_m;";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next()) {
            	lstStat.add(new Stat(rs.getString("mois"), rs.getLong(2)));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-005 Error stats counting user activities. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "006");
        }

        return lstStat;

    }
    
    /**
     * 
     * @return Retourne le nombre d'utilisateurs en provenance de l'extérieur tels que LBB ou PE.FR
     * @throws Exception
     */
    public static ArrayList<Stat> getIncomingUsersFromSource(String source) throws Exception
    {
    	ArrayList<Stat> lstStat = new ArrayList<Stat>();
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            String sqlStartDate = getSQLStartDate();

            con = DatabaseManager.getConnection();
            String sql = "SELECT DATE_FORMAT(creationTime, '%m/%y') as mois, COUNT(*), DATE_FORMAT(creationTime, '%y%m') as idx FROM users ";

            if(source!=null)
                sql += "WHERE source = '" + source + "' ";
            else
                sql += "WHERE source <>'pole-emploi' AND source <> 'labonneboite' AND source <> 'emploistore' ";

            sql +=  "AND creationTime > '"+sqlStartDate+"' " +
	            			"GROUP BY mois, idx " +
	            			"ORDER BY idx;";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next()) {
            	lstStat.add(new Stat(rs.getString("mois"), rs.getLong(2), new Long(rs.getString("idx"))));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-007 Error stats counting users incoming. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "008");
        }

        return lstStat;

    }
    
    /**
     * 
     * @return Retourne le nombre de candidatures enregistrées selon le jobboard
     * @throws Exception
     */
    public static ArrayList<Stat> getIncomingCandidaturesFromSource(String jobboard) throws Exception
    {
    	ArrayList<Stat> lstStat = new ArrayList<Stat>();
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            String sqlStartDate = getSQLStartDate();

            con = DatabaseManager.getConnection();
            String sql = "SELECT DATE_FORMAT(creationDate, '%m/%y') as mois, count(*) FROM motivaction.candidatures ";


            if(jobboard!=null)
                sql += "WHERE jobboard = '" + jobboard + "' ";
            else
                sql += "WHERE jobboard <>'Pôle Emploi' AND jobboard <> 'La Bonne Boîte' AND  jobboard IS NOT NULL ";


            sql +=                 "AND creationDate > '"+sqlStartDate+"' " +
            				"GROUP BY mois " +
            				"ORDER BY STR_TO_DATE(CONCAT(mois, '/01'), '%m/%y/%d');";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next()) {
            	lstStat.add(new Stat(rs.getString("mois"), rs.getLong(2)));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-007 Error stats counting candidatures incoming. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "009");
        }

        return lstStat;

    }
    
    /**
     * 
     * @return Retourne le nombre de candidatures enregistrées via bouton d'import chez nos partenaires
     * @throws Exception
     */
    public static ArrayList<Stat> getIncomingCandidaturesFromButton(String jobboard) throws Exception
    {
    	ArrayList<Stat> lstStat = new ArrayList<Stat>();
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;

        try
        {
            String sqlStartDate = getSQLStartDate();

            con = DatabaseManager.getConnection();
            String sql = "SELECT DATE_FORMAT(creationDate, '%m/%Y') as mois, count(*) FROM motivaction.candidatures " +
            				"WHERE jobboard = '" + jobboard + "' AND isButton = 1 " +
                            "AND creationDate > '"+sqlStartDate+"' " +
            				"GROUP BY mois " +
            				"ORDER BY STR_TO_DATE(CONCAT(mois, '/01'), '%m/%y/%d');";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next()) {
            	lstStat.add(new Stat(rs.getString("mois"), rs.getLong(2)));
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-007 Error stats counting candidatures incoming. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "010");
        }

        return lstStat;

    }

    public static String getSQLStartDate()
    {
        LocalDate date = LocalDate.now();

        LocalDate res = date.withDayOfMonth(1);
        res = res.minusYears(1);

        return res.format(DateTimeFormatter.BASIC_ISO_DATE);
    }
    
    /**
     * 
     * @return Retourne le nombre de candidatures par type de candidature pour les utilisateurs assidus
     * @throws Exception
     */
    public static HashMap getTypeCandidature() throws Exception
    {
    	//ArrayList<Stat> lstStat = new ArrayList<Stat>();
        HashMap cartesParTypesParMois = new HashMap();
    	String key;
    	Long value;
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        try
        {
            String sqlStartDate = getSQLStartDate();

            con = DatabaseManager.getConnection();
            String sql = "SELECT DATE_FORMAT(candidatures.creationDate, '%m/%Y') as mois, type, count(*) FROM motivaction.candidatures " +
                    "WHERE type>0 AND userId IN (SELECT userId FROM utilisateursAssidus) " +
                    "AND candidatures.creationDate > '"+sqlStartDate+"' " +
            				"GROUP BY mois, type ORDER BY DATE_FORMAT(candidatures.creationDate, '%Y%m'), type;";

            pStmt = con.prepareStatement(sql);

            rs = pStmt.executeQuery();

            while (rs.next()) {

                int type = rs.getInt("type");
                ArrayList cartesParMois = (ArrayList)cartesParTypesParMois.get(type);
                if(cartesParMois==null)
                    cartesParMois = new ArrayList();

                String[] cartesDuMois = new String[2];
                cartesDuMois[0]=rs.getString("mois");
                cartesDuMois[1]=""+rs.getLong(3);

                cartesParMois.add(cartesDuMois);

                cartesParTypesParMois.put(type, cartesParMois);
            }
        }
        catch (Exception e)
        {
            log.error(logCode+"-007 Error stats counting type candidatures. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "011");
        }

        return cartesParTypesParMois;

    }

    public static ArrayList getNbCandidatureReseau() throws Exception
    {
        Connection con = null;
        PreparedStatement pStmt = null;
        ResultSet rs = null;
        ArrayList result = new ArrayList();
        try
        {
            con = DatabaseManager.getConnection();
            String sql = "CALL getUtilisationCartesReseau()";
            pStmt = con.prepareStatement(sql);
            rs = pStmt.executeQuery();

            NbCandidatureReseauValue val = null;

            while(rs.next())
            {
                Timestamp ts = rs.getTimestamp(2);

                if(val==null || val.getPeriode().getYear()!=ts.getYear() || val.getPeriode().getMonth()!=ts.getMonth())
                {
                    if(val!=null)
                        result.add(val);
                    val = new NbCandidatureReseauValue();
                    val.setPeriode(ts);
                }

                StatsDAO.initNbCandidatureReseauValueFromResultSet(rs,val);
            }
            result.add(val);
        }
        catch (Exception e)
        {
            log.error(logCode+"-012 Error stats getting nb candidatures réseau. error="+e);
            throw new Exception("DB Error");
        }
        finally
        {
            DatabaseManager.close(con, pStmt, rs, logCode, "013");
        }

        return result;

    }

    private static void initNbCandidatureReseauValueFromResultSet(ResultSet rs, NbCandidatureReseauValue val) throws Exception
    {
        int nbCarte = rs.getInt("nbCarte");
        int nbUsers = rs.getInt(3);

        switch (nbCarte)
        {
            case 1 : {
                val.setNbCarte1(nbUsers);
                break;
            }
            case 2 : {
                val.setNbCarte2_3(nbUsers);
                break;
            }
            case 4 : {
                val.setNbCarte4_5(nbUsers);
                break;
            }
            case 6 : {
                val.setNbCarte6(nbUsers);
                break;
            }
        }
    }

}
