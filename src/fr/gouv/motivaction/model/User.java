package fr.gouv.motivaction.model;

import java.net.URLEncoder;
import java.sql.Timestamp;


public class User {

    private String login;
    private String password;
    private String validationCode;
    private String changePasswordToken;
    private Timestamp creationTime;
    private Timestamp lastPasswordChange;
    private long id;
    private long facebookId;
    private int validated;
    private int receiveNotification;
    private String source;
    private int autoDisableNotification;

    private String lastName;
    private String firstName;
    private String gender;
    private String peId;
    private String peEmail;

    private String city;
    private String country;
    private String zip;
    private String cityInsee;
    private String address;


    public User() {}
    		
    public User(long id, String login) {
    	this.id = id;
    	this.login = login;
    }
    
    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public int getValidated() {
        return validated;
    }

    public void setValidated(int validated) {
        this.validated = validated;
    }

    public Timestamp getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(Timestamp creationTime) {
        this.creationTime = creationTime;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getFacebookId() {
        return facebookId;
    }

    public void setFacebookId(long facebookId) {
        this.facebookId = facebookId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getValidationCode() {
        return validationCode;
    }

    public void setValidationCode(String validationCode) {
        this.validationCode = validationCode;
    }

    public int getReceiveNotification() { return receiveNotification; }

    public void setReceiveNotification(int receiveNotification) { this.receiveNotification = receiveNotification; }

    public Timestamp getLastPasswordChange() {
        return lastPasswordChange;
    }

    public void setLastPasswordChange(Timestamp lastPasswordChange) {
        this.lastPasswordChange = lastPasswordChange;
    }

    public String getSource() { return source; }

    public void setSource(String source)
    {
        this.source = source;
        if(this.source!=null && this.source.length()>80)
            this.source = this.source.substring(0,80);
    }

    public String getChangePasswordToken() {
        return changePasswordToken;
    }

    public void setChangePasswordToken(String changePasswordToken) {
        this.changePasswordToken = changePasswordToken;
    }

	public int getAutoDisableNotification() {
		return autoDisableNotification;
	}

	public void setAutoDisableNotification(int autoDisableNotification) {
		this.autoDisableNotification = autoDisableNotification;
	}

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getPeEmail() {
        return peEmail;
    }

    public void setPeEmail(String peEmail) {
        this.peEmail = peEmail;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPeId() {
        return peId;
    }

    public void setPeId(String peId) {
        this.peId = peId;
    }

    public String getCity() { return city; }

    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country;    }

    public void setCountry(String country) { this.country = country; }

    public String getZip() { return zip; }

    public void setZip(String zip) { this.zip = zip; }

    public String getCityInsee() { return cityInsee; }

    public void setCityInsee(String cityInsee) { this.cityInsee = cityInsee; }

    public String getAddress() { return address; }

    public void setAddress(String address) { this.address = address; }

    public String toJSON()
    {
        String res = "{";

        res += "\"login\":\""+(login==null?"":login)+"\"";


        if(peId!=null)
            res += ",\"isPEAM\":1";

        res += ",\"creationTime\":"+creationTime.getTime();
        if(source!=null)
            res += ",\"source\":\""+source+"\"";

        try
        {
            if(firstName!=null)
                res += ",\"firstName\":\""+URLEncoder.encode(firstName,"UTF-8")+"\"";
            if(lastName!=null)
                res += ",\"lastName\":\""+URLEncoder.encode(lastName,"UTF-8")+"\"";
            if(zip!=null)
                res += ",\"zip\":\""+URLEncoder.encode(zip,"UTF-8")+"\"";
            if(city!=null)
                res += ",\"city\":\""+URLEncoder.encode(city,"UTF-8")+"\"";
            if(address!=null)
                res += ",\"address\":\""+ URLEncoder.encode(address,"UTF-8")+"\"";
            if(country!=null)
                res += ",\"country\":\""+URLEncoder.encode(country,"UTF-8")+"\"";
        }
        catch (Exception e){}

        res += "}";

        return res;
    }
}
