package fr.gouv.motivaction.model;

import java.util.ArrayList;

/**
 * Created by Alan on 22/07/2016.
 */
public class UserSummary {

    private long userId;
    private String email;
    private int newCandidatureCount;
    private int entretienCount = 0;
    private ArrayList aiRelance; // AI_RELANCE
    private ArrayList doisRelancer; // DOIS_RELANCER
    private ArrayList remercierEntretien;
    private ArrayList relancerEntretien;
    private ArrayList vaPostuler, vaPostulerSpont; // VA_POSTULER
    private ArrayList aiPostule; // AI_POSTULE
    //private ArrayList archiver;
    private ArrayList preparer;

    public UserSummary() {}
    
    public UserSummary(long userId, String email) {
    	this.userId = userId;
    	this.email = email;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public ArrayList getAiRelance() {
        return aiRelance;
    }

    public void addAiRelance(CandidatureReport cand)
    {
        if(this.aiRelance==null)
            this.aiRelance = new ArrayList();
        this.aiRelance.add(cand);
    }
    
    public ArrayList getDoisRelancer() {
        return doisRelancer;
    }

    public void addDoisRelancer(CandidatureReport cand)
    {
        if(this.doisRelancer==null)
            this.doisRelancer = new ArrayList();
        this.doisRelancer.add(cand);
    }

    public ArrayList getRemercierEntretien() {
        return remercierEntretien;
    }

    public void setRemercierEntretien(ArrayList remercierEntretien) {
        this.remercierEntretien = remercierEntretien;
    }

    public void addRemercierEntretien(CandidatureReport cand)
    {
        if(this.remercierEntretien==null)
            this.remercierEntretien = new ArrayList();
        this.remercierEntretien.add(cand);
    }

    public ArrayList getRelancerEntretien() {
        return relancerEntretien;
    }

    public void setRelancerEntretien(ArrayList relancerEntretien) {
        this.relancerEntretien = relancerEntretien;
    }

    public void addRelancerEntretien(CandidatureReport cand)
    {
        if(this.relancerEntretien==null)
            this.relancerEntretien = new ArrayList();
        this.relancerEntretien.add(cand);
    }

    public ArrayList getAiPostule() {
        return aiPostule;
    }

    public void addAiPostule(CandidatureReport cand)
    {
        if(this.aiPostule==null)
            this.aiPostule = new ArrayList();
        this.aiPostule.add(cand);
    }
    
    public ArrayList getVaPostuler() {
        return vaPostuler;
    }
    
    public void addVaPostuler(CandidatureReport cand)
    {
        if(this.vaPostuler==null)
            this.vaPostuler = new ArrayList();
        this.vaPostuler.add(cand);
    }

    public ArrayList getPostulerSpont() {
		return vaPostulerSpont;
	}
	
	public void addVaPostulerSpont(CandidatureReport cand)
    {
        if(this.vaPostulerSpont==null)
            this.vaPostulerSpont = new ArrayList();
        this.vaPostulerSpont.add(cand);
    }

    /*public ArrayList getArchiver() {
        return archiver;
    }

    public void setArchiver(ArrayList archiver) {
        this.archiver = archiver;
    }

    public void addArchiver(CandidatureReport cand)
    {
        if(this.archiver==null)
            this.archiver = new ArrayList();
        this.archiver.add(cand);
    }*/

    public ArrayList getPreparer() {
        return preparer;
    }

    public void setPreparer(ArrayList preparer) {
        this.preparer = preparer;
    }

    public void addPreparer(CandidatureReport cand)
    {
        if(this.preparer==null)
            this.preparer = new ArrayList();
        this.preparer.add(cand);
    }

	public int getEntretienCount() {
		return entretienCount;
	}

	public void addEntretienCount() {
		this.entretienCount++;
	}
}
