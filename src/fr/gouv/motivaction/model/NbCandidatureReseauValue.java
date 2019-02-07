package fr.gouv.motivaction.model;

import java.sql.Timestamp;

public class NbCandidatureReseauValue {

    private int nbCarte1 = 0;
    private int nbCarte2_3 = 0;
    private int nbCarte4_5 = 0;
    private int nbCarte6 = 0;
    private Timestamp periode;

    public int getNbCarte1() {
        return nbCarte1;
    }

    public void setNbCarte1(int nbCarte1) {
        this.nbCarte1 = nbCarte1;
    }

    public int getNbCarte2_3() {
        return nbCarte2_3;
    }

    public void setNbCarte2_3(int nbCarte2_3) {
        this.nbCarte2_3 = nbCarte2_3;
    }

    public int getNbCarte4_5() {
        return nbCarte4_5;
    }

    public void setNbCarte4_5(int nbCarte4_5) {
        this.nbCarte4_5 = nbCarte4_5;
    }

    public int getNbCarte6() {
        return nbCarte6;
    }

    public void setNbCarte6(int nbCarte6) {
        this.nbCarte6 = nbCarte6;
    }

    public Timestamp getPeriode() {
        return periode;
    }

    public void setPeriode(Timestamp periode) {
        this.periode = periode;
    }
}
