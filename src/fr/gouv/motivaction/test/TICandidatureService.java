package fr.gouv.motivaction.test;
import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import fr.gouv.motivaction.Constantes.JobBoardUrl;
import fr.gouv.motivaction.dao.CandidatureDAO;
import fr.gouv.motivaction.model.Candidature;
import fr.gouv.motivaction.service.CandidatureService;


public class TICandidatureService {

	@Before
	public void setUp() throws Exception {
	}

	@After
	public void tearDown() throws Exception {
	}
	
	@Test
	public void testHtmlContentPoleEmploi() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.POLE_EMPLOI);			
			this.testHtmlContent(candidature, JobBoardUrl.POLE_EMPLOI);
			
		} catch(Exception e) {
			fail(JobBoardUrl.POLE_EMPLOI.name() + " - 003 - extraction HTML plantée - " + e);
		}	 
	}
	
	@Test
	public void testHtmlContentLeBonCoin() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.LEBONCOIN);			
			this.testHtmlContent(candidature, JobBoardUrl.LEBONCOIN);
			
		} catch(Exception e) {
			fail(JobBoardUrl.LEBONCOIN.name() + " - 003 - extraction HTML plantée - " + e);
		}	 
	}
	
	@Test
	public void testHtmlContentIndeed() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.INDEED);			
			this.testHtmlContent(candidature, JobBoardUrl.INDEED);
			
		} catch(Exception e) {
			fail(JobBoardUrl.INDEED.name() + " - 003 - extraction HTML plantée - " + e);
		}	 
	}
	
	@Test
	public void testHtmlContentVivastreet() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.VIVASTREET);			
			this.testHtmlContent(candidature, JobBoardUrl.VIVASTREET);
			
		} catch(Exception e) {
			fail(JobBoardUrl.VIVASTREET.name() + " - 003 - extraction HTML plantée - " + e);
		}	 
	}
	
	@Test
	public void testHtmlContentMonster() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.MONSTER);			
			this.testHtmlContent(candidature, JobBoardUrl.MONSTER);
			
		} catch(Exception e) {
			fail(JobBoardUrl.MONSTER.name() + " - 003 - extraction HTML plantée - " + e);
		}	 
	}
	
	@Test
	public void testHtmlContentKeljob() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.KELJOB);			
			this.testHtmlContent(candidature, JobBoardUrl.KELJOB);
			
		} catch(Exception e) {
			fail(JobBoardUrl.KELJOB.name() + " - 003 - extraction HTML plantée - " + e);
		}	 
	}
	
	@Test
	public void testHtmlContentCadremploi() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.CADREMPLOI);			
			this.testHtmlContent(candidature, JobBoardUrl.CADREMPLOI);
			
		} catch(Exception e) {
			fail(JobBoardUrl.CADREMPLOI.name() + " - 003 - extraction HTML plantée - " + e);
		}	 
	}
	
	@Test
	public void testHtmlContentApec() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.APEC);			
			this.testHtmlContent(candidature, JobBoardUrl.APEC);
			
		} catch(Exception e) {
			fail(JobBoardUrl.APEC.name() + " - 003 - extraction HTML plantée - " + e);
		}	 
	}
	
	@Test
	public void testHtmlContentMeteojob() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.METEOJOB);			
			this.testHtmlContent(candidature, JobBoardUrl.METEOJOB);
			
		} catch(Exception e) {
			fail(JobBoardUrl.METEOJOB.name() + " - 003 - extraction HTML plantée - " + e);
		}	 
	}
	
	@Test
	public void testHtmlContentGeneric() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadLastUpdateByJobBoard(JobBoardUrl.GENERIQUE);			
			this.testHtmlContent(candidature, JobBoardUrl.GENERIQUE);
			
		} catch(Exception e) {
			fail(JobBoardUrl.METEOJOB.name() + " - 003 - extraction HTML plantée - " + e);
		}
	}
	
	/*@Test
	public void testHtmlContentJob() {
		Candidature candidature = null;
		
		try {
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadByJobBoardTI(JobBoard.OUESTJOB);			
			this.testHtmlContentGeneric(candidature, JobBoard.OUESTJOB);
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadByJobBoardTI(JobBoard.PARISJOB);			
			this.testHtmlContentGeneric(candidature, JobBoard.PARISJOB);
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadByJobBoardTI(JobBoard.NORDJOB);			
			this.testHtmlContentGeneric(candidature, JobBoard.NORDJOB);
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadByJobBoardTI(JobBoard.CENTREJOB);			
			this.testHtmlContentGeneric(candidature, JobBoard.CENTREJOB);
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadByJobBoardTI(JobBoard.ESTJOB);			
			this.testHtmlContentGeneric(candidature, JobBoard.ESTJOB);
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadByJobBoardTI(JobBoard.RHONEALPESJOB);			
			this.testHtmlContentGeneric(candidature, JobBoard.RHONEALPESJOB);
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadByJobBoardTI(JobBoard.SUDOUESTJOB);			
			this.testHtmlContentGeneric(candidature, JobBoard.SUDOUESTJOB);
			// Récupératon de la candidature la plus récente correspondant au jobboard en paramètre
			candidature = CandidatureDAO.loadByJobBoardTI(JobBoard.PACAJOB);			
			this.testHtmlContentGeneric(candidature, JobBoard.PACAJOB);
		} catch(Exception e) {
			fail("Job.com - 003 - extraction HTML plantée - " + e);
		}	 
	}*/
	
	private void testHtmlContent(Candidature candidature, JobBoardUrl jobBoard) {
		String html = "";
		try {
			if (candidature != null) {
				// Epuration HTML
				if (jobBoard == JobBoardUrl.GENERIQUE) {
					html = CandidatureService.getHtmlContentFromUrl(candidature.getUrlSource(), true);
				} else {
					html = CandidatureService.getHtmlContentFromUrl(candidature.getUrlSource(), false);
				}
					
			} else {
				fail(jobBoard.name() + " - 000 - aucune candidature trouvée");
			}
			if (html.isEmpty()) {
				fail(jobBoard.name() + " - 001 - extraction vide");
			}
		} 
		catch(Exception e) {
			fail(jobBoard.name() + " - 002 - extraction HTML KO - " + e);
		}
	}
	
	@Test
	public void testGetOffrePoleEmploiFromAPI() {
		try {
			CandidatureService.getOffrePoleEmploiFromAPI("063WRWW");
		}
		catch(Exception e) {
			fail("GetPoleEmploiAPIAccessToken : "+e);
		}
	}
}
