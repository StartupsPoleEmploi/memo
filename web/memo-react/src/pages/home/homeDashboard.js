import React, { Component } from 'react';
import BlueLine from '../../components/blueLine.js';
import EmploiStoreRanking from './emploiStoreRanking.js';
import imageTableaudebord from '../../pic/image-tableaudebord.png';

class HomeDashboard extends Component{

    render()
    {
        return <div className='row homeBlockMargin'>
            <div className='hidden-xs hidden-sm col-md-7'>
                <div className='homeDashboardBorder'>
                    <img src={imageTableaudebord} alt="Exemple de tableau de bord MEMO" />
                </div>
            </div>
            <div className='col-md-5'>
                <h2 className='topMargin0 marginLeft30'>
                La plateforme idéale pour les demandeurs d'emploi
                </h2>
                <BlueLine className='left' />
                <p className='marginLeft30'>
                MEMO accompagne aujourd'hui plus de 400 000 chercheurs d'emploi, quelle que soit leur expérience ou leur activité recherchée.
                </p>
                <EmploiStoreRanking />
            </div>
        </div>
        
    }
}
export default HomeDashboard;