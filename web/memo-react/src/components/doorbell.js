import React, { Component } from 'react';
import { navigate } from "@reach/router"

class Doorbell extends Component{


    constructor(props)
    {
        super(props);
        this.state = {visible:false};
        if(!this.doorbellInitiated)
            this.initDoorbell();
    }

    async initDoorbell(){

        (function(d, t) {
            var g = d.createElement(t);g.id = 'doorbellScript';g.type = 'text/javascript';g.async = true;g.src = 'https://embed.doorbell.io/button/8059?t='+(new Date().getTime());(d.getElementsByTagName('head')[0]||d.getElementsByTagName('body')[0]).appendChild(g);
        }(document, 'script'));
        this.doorbellInitiated = true;
    }


    componentDidMount(){
        if(this.doorbellInitiated)
            this.setState({visible:true});
    }

    openDoorbell(e){
        e.stopPropagation();
        navigate("/faq");

    }

    render()
    {
        return <div onClick={this.openDoorbell} className={'doorbell-button'+(this.state.visible?' doorbell-visible':'')}>Avis ou commentaire</div>;
    }
}
export default Doorbell;