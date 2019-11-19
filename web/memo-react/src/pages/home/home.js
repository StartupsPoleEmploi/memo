import React, { Component } from 'react';
import Header from '../../components/header.js';
import MainHomeTitle from './mainHomeTitle.js';
import HomeDashboard from './homeDashboard.js';
import HomeFeatures from './homeFeatures.js';
import HomeComments from './homeComments.js';
import HomeTeam from './homeTeam.js';
import HomeWave from './homeWave.js';

class Home extends Component{

    render()
    {
        console.log('Render home.js');
        
        return <div className='home'>
            <Header />
            <MainHomeTitle />
            <HomeDashboard />
            <HomeFeatures />
            <HomeComments />
            <HomeTeam />
            <HomeWave />
        </div>
    }
}
export default Home;