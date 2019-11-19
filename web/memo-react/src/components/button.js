import React, { Component } from 'react';
import Tippy from '@tippy.js/react';

class Button extends Component{

    constructor(props)
    {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event)
    {
        event.persist();
        this.props.onClick(event);
    }

    render()
    {
        let res;
        const tooltip = this.props.tooltip;

        if(this.props.title)
        {
            res = <button type='button' onClick={this.handleClick} className={this.props.className} tabIndex="0">
                <span className='sr-only'>{this.props.srOnly}</span>
                {this.props.icon?<i className={this.props.icon} />:''}
                {this.props.title}
                </button>;
        }
        else
            res = <button type='button' onClick={this.handleClick} tabIndex="0">
                    <i className={this.props.className} />
                    <span className='sr-only'>{this.props.srOnly}</span>               
                    </button>;

        if(tooltip)        
            return <Tippy   content={tooltip} 
                            allowHTML="true" 
                            animation='shift-toward' 
                            placement={this.props.placement?this.props.placement:"left"} 
                            maxWidth={200}
                            maxduration={[0,0]} 
                            trigger="mouseenter focus" >
                    {res}
                    </Tippy>;
        else
            return res;
    }
}
export default Button;
