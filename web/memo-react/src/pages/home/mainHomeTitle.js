import React, { Component } from 'react';
import StartButton from './startButton.js';
import Fse from './fse.js';
import $ from 'jquery';

class MainHomeTitle extends Component{

    componentDidMount()
    {
        $(window).scrollTop(0);
    }

    render()
    {
        return <div className='row homeMainTitle'>
            <h1>Un espace unique pour organiser toutes vos candidatures</h1>
            <h3>Avec MEMO, simplifiez le suivi de toutes vos démarches.</h3>
            <StartButton />
            <Fse />
        </div>
    }
}
export default MainHomeTitle;