package fr.gouv.motivaction.model;

public class Stat implements Comparable<Stat>{
	
	private String cle;
	private Long valeur;
	private Long index;
	
	public Stat(String cle, Long valeur) {
		this.cle = cle;
		this.valeur = valeur;
	}
	
	public Stat(String cle, Long valeur, Long index) {
		this.cle = cle;
		this.valeur = valeur;
		this.index = index;
	}
	
	public String getCle() {
		return cle;
	}
	public void setCle(String cle) {
		this.cle = cle;
	}
	public Long getValeur() {
		return valeur;
	}
	public void setValeur(Long valeur) {
		this.valeur = valeur;
	}

	public Long getIndex() {
		return index;
	}

	public void setIndex(Long index) {
		this.index = index;
	}
	
	public int compareTo(Stat compare) {
		int result = 0;
		if (compare != null) {
			if(this.index == compare.getIndex())
				result = 0;
			else if(this.index > compare.getIndex())
				result = 1;
			else
				result = -1;
		}
		return result;
	}

	@Override
	public boolean equals(Object compare) {
		boolean result = false;
		if (compare != null) 
			if(this.cle.equals(((Stat)compare).getCle()))
				result = true;
		return result;
	}

	@Override
	public String toString() {		
		return this.cle + " : " + this.valeur + "(" + this.index + ")";
	}
	
	
	
}
