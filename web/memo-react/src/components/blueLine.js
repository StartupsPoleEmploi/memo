import React, { Component } from 'react';

class BlueLine extends Component{
    render() {
        return <div className={"blueLine " + this.props.className} />
    }
}
export default BlueLine;