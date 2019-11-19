import React, { Component } from 'react';
import pictoEtoile from '../../pic/pictos/etoile.svg';
import pictoDemieEtoile from '../../pic/pictos/demie-etoile.svg';

class EmploiStoreRanking extends Component{
    render()
    {
        return <div className='esRanking'>
                    <div className='ranking'>4.5</div>
                    <div className='rankingStars'>
                        <img src={pictoEtoile} alt="" className='star' />
                        <img src={pictoEtoile} alt="" className='star' />
                        <img src={pictoEtoile} alt="" className='star' />
                        <img src={pictoEtoile} alt="" className='star' />
                        <img src={pictoDemieEtoile} alt="" className='star' />
                    </div>
                    <div className='rankingLink'>
                        <a target='_blank' rel='noopener' href='https://www.emploi-store.fr/portail/services/memo'>
                            Sur Emploi Store
                        </a>
                    </div>
            </div>
    }
}
export default EmploiStoreRanking;