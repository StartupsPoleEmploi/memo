import React from 'react';
import ReactDOM from 'react-dom';
import { navigate  } from "@reach/router";
import App from './App';
import * as serviceWorker from './serviceWorker';
import MemoController from './memoController.js';
import {loadBoard} from './actions/loadBoard';
import {createStore} from 'redux';
import {userReducer} from './userReducer';

export let MEMO  = new MemoController();

export const userStore = createStore(userReducer);

const render = () => { 
    ReactDOM.render(<App memoState={userStore.getState()} />, document.getElementById('root'));
}

userStore.subscribe(render);
render();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


// méthode globale utilisée pour charger le tableau de bord d'un utilisateur connecté dans l'iframe d'autologin PEConnect 
window.loadBoardFromPEAM = async function(user)
{
    window.gtag('event', 'Connexion', { event_category: 'Utilisateur', event_label : 'SSO_PEAM' });
      
    MEMO.user = user;
    userStore.dispatch({type:'SET_USER', user:user, isVisitor:false});
    await loadBoard();
    navigate('/dashboard');
}