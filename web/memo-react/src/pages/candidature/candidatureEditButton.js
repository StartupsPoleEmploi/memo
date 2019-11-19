import React, { Component } from 'react';
import '../../css/candidature.css';
import Tippy from '@tippy.js/react';

class CandidatureEditButton extends Component{

    getTooltip()
    {
        return this.props.tooltip?this.props.tooltip:"Modifier la candidature";
    }

    getIcon()
    {
        if(this.props.isRemove)
            return 'far fa-trash-alt';
        else
            return 'far fa-pen'
    }   

    render()
    {
        return (!this.props.isVisitor)?<Tippy content={this.getTooltip()} allowHTML="true" animation='shift-toward' placement="left" duration={[0,0]} trigger="mouseenter focus">
            <button className="candidatureEditButton" onClick={this.props.onClick}><i className={this.getIcon()}></i></button>
        </Tippy>:''
    }
}
export default CandidatureEditButton;