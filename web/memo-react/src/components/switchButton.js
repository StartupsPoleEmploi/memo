import React, { Component } from 'react';
import '../css/switchButton.css';

class SwitchButton extends Component{

    handleClick = event => 
    {
        event.stopPropagation();
        const newPosition = this.props.switchPosition?0:1;
        this.props.onClick(newPosition);
    }
    
    render()
    {
        return <div className={"memoSwitchContainer "+(!this.props.switchPosition?"memoSwitchIsOff":"")} 
                    onClick={this.handleClick}>
                <div className={"memoSwitchOn "+(this.props.switchPosition?"memoSwitchActive":"")}>Oui</div>
                <div className={"memoSwitchOff "+(!this.props.switchPosition?"memoSwitchActive":"")}>Non</div>            
            </div>
    }
}
export default SwitchButton;
