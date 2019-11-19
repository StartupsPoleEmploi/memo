import React, { Component } from 'react';
import Button from '../../components/button.js';
import { MEMO } from "../../index.js";


class StartButton extends Component{

    render()
    {
        return <Button title="Commencer" 
                        className='homeStartButton' 
                        srOnly="Ouvrir la page pour commencer à utiliser MEMO"
                        onClick={(evt)=>{MEMO.openCreationAccountPage(evt);}}
                        />
    }
}
export default StartButton;