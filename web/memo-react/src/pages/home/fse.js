import React, { Component } from 'react';
import logoFSE from '../../pic/logo_fse.svg';
import logoEurope from '../../pic/logo_europe.svg';
import texteEurope from '../../pic/texte_europe.svg';


class Fse extends Component{

    render()
    {
        return <div className='FSE'>
            <img src={logoFSE} alt="logo Fond Social Européen" />
            <img src={logoEurope} alt="Drapeau de l'Union Européenne" />
            <img src={texteEurope} alt="Ce dispositif est cofinancé par le Fonds social européen dans le cadre du Programme opérationnel national Emploi et inclusion 2014-2020" />
        </div>
    }
}
export default Fse;