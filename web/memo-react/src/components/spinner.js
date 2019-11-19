import React, { Component } from 'react';
import '../css/spinner.css';

class Spinner extends Component{

    getText() 
    {
        return <div>
                {this.props.text?this.props.text:<span>Chargement en cours<br />Merci de patienter</span>}
            </div>
    }

    render() {
        return <div className='spinner'>
                <i className='fa fa-spinner fa-spin' />
                {this.getText()}
            </div>
    }
}
export default Spinner;