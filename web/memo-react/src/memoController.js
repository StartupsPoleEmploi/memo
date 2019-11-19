import { navigate } from "@reach/router"
import { userStore, MEMO } from './index.js';
import { logoutUser } from './actions/userActions';
import { manageOffreExpiry } from './actions/importActions';
import { loadBoard } from './actions/loadBoard';


class MemoController
{
    constructor()
    {
        this.rootURL = window.location.protocol+"//"+window.location.hostname;
	}

    async disconnect()
    {
        window.gtag('event', 'Déconnexion', { event_category: 'Utilisateur' }); 

        logoutUser()
        .finally( () => { 
            
            console.log("logout : ",this.user);
            if(this.user.isPEAM)
                MEMO.shouldDisconnectUserFromPE = true;
            
            this.user = null;
            this.visitorLink = null;
            this.stopAgents();
            userStore.dispatch({type:'DISCONNECT'})
            navigate('/');
        })    
    }


    openConnectionPage(evt)
    {
        evt.stopPropagation();
        navigate('/connection');
        console.log("openConnectionpage : ",evt);
    }

    openCreationAccountPage(evt)
    {
        evt.stopPropagation();
        navigate('/creationCompte');
        console.log("openCreationAccountPage : ",evt);
    }

    openFAQ(evt)
    {
        evt.stopPropagation();
        navigate('/faq');
        console.log("openFAQ: ",evt);
    }

    openParameterPage(evt)
    {
        evt.stopPropagation();
        navigate("/parametres");
    }

    openCGU(evt)
    {
        evt.stopPropagation();
        navigate('/cgu');
        console.log("openCGU: ",evt);
    }

    openPolicyInfo(evt)
    {
        evt.stopPropagation();
        navigate('/policyInfo');
        console.log("openPolicyInfo: ",evt);
    }

    openPolicyAccept(evt)
    {
        evt.stopPropagation();
        navigate('/policyAccept');
        console.log("openPolicyAccept: ",evt);
    }
    
    openDashboardPage(e) {
        e.stopPropagation();
        navigate("/dashboard");
    }

    openArchivePage(e) {
        e.stopPropagation();
        navigate("/dashboard/archives");
    }

    openActionPage(e) {
        e.stopPropagation();
        console.log("e : ",e);
        navigate("/actions");
    }
    
    openAdvicePage(e) {
        e.stopPropagation();
        console.log("e : ",e);
        navigate("/conseils");
    }    

    openNewCandidature(e){
        e.stopPropagation();
        //console.log(e.target, e.target.getAttribute("type"));
        const type = e.target.getAttribute("type");
        window.selectedCandidatureType=(type&&type!=="button")?type:0;

        window.gtag('event', 'Ouverture tunnel', { event_category: 'Candidature', event_label: window.selectedCandidatureType });     

        navigate("/nouvelleCandidature");    
    }


    startAgents = () =>
    {
        //console.log("start agents");
        this.startRefreshBoardChecking();
        this.startExpiredChecking();
    }

    stopAgents = () =>
    {
        //console.log("stop agents");
        this.candidaturesToCheck = null;
        this.stopRefreshBoardChecking();
    }

    // démarre le processus de vérification du besoin de reload du tableau de bord suite à import dans un autre onglet du navigateur
    startRefreshBoardChecking = () =>
    {
        if(!this.refreshBoardCheckingStarted)
            this.refreshBoardCheckingStarted = setInterval(this.checkForBoardRefresh,5000);
    }

    stopRefreshBoardChecking = () =>
    {
        clearInterval(this.refreshBoardCheckingStarted);
        this.refreshBoardCheckingStarted = 0;
    }

    checkForBoardRefresh = () =>
    {
        if(eval(localStorage.getItem("refreshBoardAfterImport")))
        {
            localStorage.setItem("refreshBoardAfterImport",0);
            this.redirectDestination = "/dashboard";
            loadBoard();
        } else if(eval(localStorage.getItem("refreshBoardFromBO"))) {
            localStorage.setItem("refreshBoardFromBO",0);
            this.redirectDestination = "/dashboard";
        	//lBR.board.candidatures = {};
            loadBoard();
        }
        //console.log("checkForBoardRefresh");
    }

    startExpiredChecking = () =>
    {
        //console.log("startExpiredChecking");
        if(!this.isVisitor && this.user.candidatures)
        {
            this.candidaturesToCheck = [];
            for(let k in this.user.candidatures)
            {
                this.candidaturesToCheck.push(k);
            }
            this.checkOffre(0);
        }
    }

    checkOffre = idx => 
    {
        //console.log("checkOffre : ",idx);
        if(this.user)
        {
            let cId = this.candidaturesToCheck[idx];

            if(cId)
            {
                manageOffreExpiry(cId,idx);            
            }
        }
    }
}

export default MemoController;