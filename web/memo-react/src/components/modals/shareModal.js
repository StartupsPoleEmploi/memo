import React, { Component } from 'react';
import ReactModal from 'react-modal';
import { getShareLink } from '../../actions/userActions';
import Spinner from '../spinner.js';
import Tippy from '@tippy.js/react';

// modale de chargement et d'affichage d'un lien de partage
class ShareModal extends Component{


    constructor(props)
    {
        super(props);
        this.state={
                isLoading:true, 
                errorMsg:"", 
                shareLink:""
        };
    }

    componentDidUpdate(prevProps,prevState)
    {
        if(this.props.showShareModal && !prevProps.showShareModal)
        {
            this.getShareLink();
        }
    }

    getModalBody()
    {
        let res="";
        if(this.state.errorMsg)
        {
            res = <div>
                    Une erreur technique s'est produite. Veuillez réessayer plus tard. Si le problème persiste, veuillez contacter le support produit
                    <div className="modalActions">
                        {this.getCloseButton("text")}
                    </div>
                </div>
        }
        else
        {
            res = this.getForm();
        }

        return res;
    }

    getCloseButton(type)
    {
        let res="";
        
        if(type=="cross")
        {    res = <Tippy content="Fermer" animation='shift-toward' placement="top" duration={[0,0]} trigger="mouseenter focus">
                <button className='modalClose' onClick={this.props.handleCloseModal}><i className='fal fa-times'></i></button>
            </Tippy>
        }
        else
            res = <button type="button" onClick={this.props.handleCloseModal} className='modalClose'>Fermer</button>
        
        return res;
    }

    getCopyButton()
    {
        let res="";
        
        res = <button type="button" onClick={this.onCopy} >Copier le lien</button>
        
        return res;
    }

    onCopy = e => 
    {
        e.stopPropagation();
        this.textArea.select();
        document.execCommand("copy");
    }

    getForm()
    {
        let res="";

        if(!this.state.isLoading)
        {
            res =   <div>
                        <div className='modalText'>Communiquez le lien ci-dessous aux personnes à qui vous souhaitez montrer votre tableau de bord : </div>
                        <div className='modalForm'>                        
                            <div className="row shareLink modalComment">
                                <textarea readOnly={true} value={this.state.shareLink} ref={(textarea) => this.textArea = textarea}>
                                </textarea>
                            </div>                
                        </div>
                        <div className='modalText'>Vous restez le seul à pouvoir modifier votre tableau de bord.<br /><br /><strong>Ce lien est valable 30 jours.</strong></div>
                        <div className='modalActions'>
                            {this.getCopyButton()}
                            {this.getCloseButton("text")}                
                        </div>
                    </div>
        }
        else
        {
            res = <div className='modalForm'>
               <Spinner />
               </div>
        }

        return res;
    }

    getShareLink()
    {
        this.setState({
            isLoading:true,
            shareLink:""});

        getShareLink()
        .then(function(response) {
            return response.json()
        })
        .then(async function(json) {
            if(json.result=='ok')
                this.setState({shareLink:window.location.origin+"?link="+json.visitorLink});
            else
                throw new Error(json.msg);                
        }.bind(this))
        .catch(msg =>
        {
            this.setState({ errorMsg : msg })
        })
        .finally( () => { this.setState({isLoading : false}); })

        window.gtag('event', 'shareLink', { event_category: 'Utilisateur' });
    }

    
    render()
    {        
        return <ReactModal isOpen={this.props.showShareModal}
                        contentLabel=""
                        onRequestClose={this.props.handleCloseModal}
                        appElement={document.getElementById('root')}
                        className="Modal"
                        shouldCloseOnOverlayClick={false}
                        overlayClassName="Overlay"
                >
                {this.getCloseButton("cross")}
                <div className='modalTitle'>Partager son tableau de bord</div>
                {this.getModalBody()}
            </ReactModal>
    }
}
export default ShareModal;