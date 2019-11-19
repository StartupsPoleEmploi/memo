import React, { Component } from 'react';
import Spinner from '../../components/spinner.js';
import Header from '../../components/header.js';
import Breadcrumb from '../../components/breadcrumb.js';
import $ from 'jquery';

class CGU extends Component{

    constructor(props)
    {
        super(props);
        this.state={ content:null };
    }

    componentDidMount()
    {
        //console.log(window.location.protocol,window.location.hostname);
        fetch("/cgu.html")
        .then(resp =>{
            //console.log(resp);
            return resp.text();      
        })
        .then(content => {
            //console.log(content);
            this.setState({
                content 
            });
            
        })
        .catch(err => {
            console.log("Error",err);
        });       

        $(window).scrollTop(0);
    }
    
    getMarkup(){
        return {__html:this.state.content};
    }

    render()
    {
        let res = this.getMarkup();
        return <div className="cgu">
                    <Header user={this.props.user} page="cgu"/>                   
                    <Breadcrumb page="cgu" user={this.props.user} />                   
                    <div dangerouslySetInnerHTML ={!res ? <Spinner/> : res }/>
                </div>   
    }
    
}
export default CGU;