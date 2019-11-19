import React, { Component } from 'react';
import '../../css/dashboard.css';
import { MEMO } from '../../index';

class NewCandidatureButton extends Component{



    render()
    {
        return <div onClick={MEMO.openNewCandidature} type={this.props.type} className='newCandidatureButton'>
            <strong>+</strong> Ajouter une candidature
        </div>
    }
}
export default NewCandidatureButton;