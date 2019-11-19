import React, { Component } from 'react';
import BlueLine from '../../components/blueLine.js';
import imageConseillere from '../../pic/image_conseillere.svg';

class HomeTeam extends Component{

    render()
    {
        return <div className='row homeTeam'>
            <h2>Partagez vos démarches avec votre conseiller !</h2>
            <BlueLine className='center' />
            <p>Si vous le souhaitez, vous avez la possibilité de partager votre tableau de bord MEMO avec votre conseiller à l'emploi.</p>
            <img src={imageConseillere} alt="" />
            </div>
    }
}
export default HomeTeam;