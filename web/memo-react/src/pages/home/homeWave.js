import React, { Component } from 'react';
import StartButton from './startButton.js';

class HomeWave extends Component{

    render()
    {
        return <div className='row homeWave'>

            <div className='col-sm-6 center'>
                <h2>Essayez MEMO dès maintenant</h2>
                <h2 className='white'>Créez un compte en 1 minute</h2>
            </div>
            <div className='col-sm-6 center'>
                <StartButton />
            </div>
        </div>
    }
}
export default HomeWave;