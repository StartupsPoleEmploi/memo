import React, { Component } from 'react';
import BlueLine from '../../components/blueLine.js';
import Button from '../../components/button.js';
import pictoEtoile from '../../pic/pictos/etoile.svg';
import pictoDemieEtoile from '../../pic/pictos/demie-etoile.svg';

class HomeComments extends Component{

    render()
    {
        return <div className='row homeComments'>
            <h2>MEMO, service le mieux noté sur <a href='https://www.emploi-store.fr/portail/services/memo' target='_blank'>emploi-store.fr</a></h2>
            <BlueLine className='center' />
            <p>De nombreux demandeurs d'emploi témoignent de la qualité et de la simplicité de la plateforme.</p>
            <HomeCommentCarroussel comments ={ [
                                        {
                                            stars:5,
                                            halfStars:0,
                                            text:<span><strong>Pratique, simple et rapide</strong><br />Permet de tout noter de A à Z de vos démarches en termes de recherche d'emploi et notamment très intéressant pour s'organiser quand on postule à différentes entreprise.</span>,
                                            name:"jlorieau le 04 sept. 2019"
                                        },
                                        {
                                            stars:5,
                                            halfStars:0,
                                            text:<span><strong>A utiliser sans modération</strong><br />De mon point de vue c'est la meilleure application de l'emploi store. Elle a été pensée utilisateur : Facile à utiliser, un design sobre. Je suivais mes candidatures avec un tableau excel, fini. La cerise sur le gâteau, vous avez des tas d'astuces vraiment bien faite pour vous aider dans votre recherche. Sans aucune hésitation pour c'est 5/5.</span>,
                                            name:"GMUNOZ le 27 mars 2019"
                                        },
                                        {
                                            stars:4,
                                            halfStars:0,
                                            text:<span><strong>Très utile</strong><br />j'y vois beaucoup plus clair avec memo, je gagne du temps avec la liste des priorités alors qu'avant je devais chercher mes candidatures dans mes mails.</span>,
                                            name:"Sa.S le 29 oct. 2018"
                                        },
                                        {
                                            stars:5,
                                            halfStars:0,
                                            text:<span><strong>Des interlocuteurs de qualité</strong><br />Si son "dashboard" n'est pas une révolution en soi, Memo se révèle un outil ludique et très facile d'utilisation. Et les liens proposés ("conseils") sont d'une aide précieuse. Plus important encore : le team en place cherche vraiment une issue positive aux problèmes (informatiques...) rencontrés. Le suivi du dossier est irréprochable. Merci à tous.</span>,
                                            name:"MStephane le 24 sept. 2018"
                                        }
                                    ]} />
        </div>
    }
}
export default HomeComments;

class HomeCommentCarroussel extends Component{

    constructor(props)
    {
        super(props);
        this.showPreviousComment = this.showPreviousComment.bind(this);
        this.showNextComment = this.showNextComment.bind(this);


        // note : pas besoin d'avoir comments dans les state
        this.state = {
            currentCommentIndex : 0
        }
    }

    showPreviousComment()
    {
        let idx = this.state.currentCommentIndex-1;
        idx = (idx===-1)?this.props.comments.length-1:idx;
        this.setState({currentCommentIndex:idx});
    }

    showNextComment()
    {
        let idx = this.state.currentCommentIndex+1;
        idx = (idx===this.props.comments.length)?0:idx;
        this.setState({currentCommentIndex:idx});
    }

    render()
    {
        return <div className='row homeCommentCarroussel'>

            <div className='col-md-4 col-xs-2 col-sm-2 left'>
                <Button className='fa fa-chevron-left'
                        tooltip="Voir le témoignage précédent"
                        srOnly="Cliquer pour voir le témoignage précédent"
                        onClick={()=>{this.showPreviousComment();}} />
            </div>
            
            <div className='col-md-4 col-xs-8 col-sm-8 '>
                <HomeComment comment={this.props.comments[this.state.currentCommentIndex]} />
            </div>
            
            <div className='col-md-4 col-xs-2 col-sm-2  right'>
                <Button className='fa fa-chevron-right' tooltip="Voir le témoignage suivant"
                    srOnly="Cliquer pour voir le témoignage suivant"
                    onClick={()=>{this.showNextComment();}} />
            </div>

        </div>
    }
}


class HomeComment extends React.Component{

    getStars()
    {
        let result = [];

        for(let i=0; i<this.props.comment.stars; ++i)
            result.push(<img key={'star'+i} src={pictoEtoile} alt="" className='star' />);
        for(let i=0; i<this.props.comment.halfStars; ++i)
            result.push(<img key={'halfstar'+i} src={pictoDemieEtoile} alt="" className='star' />);

        return result;
    }

    render()
    {
        return <div className='homeComment'>
                {this.getStars()}
                <div className='homeCommentText'>{this.props.comment.text}</div>
                <div className='homeCommentSignature'>
                    {this.props.comment.name+', '}
                    <span className='rankingLink'>
                        <a target='_blank' rel='noopener' href='https://www.emploi-store.fr/portail/services/memo'>Note Emploi Store</a>
                    </span>
                </div>
            </div>
    }
}