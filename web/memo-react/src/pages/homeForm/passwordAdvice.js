import React, { Component } from 'react';

class PasswordAdvice extends Component
{
    render()
    {
        return  <div className='passwordAdvice'>
                    Si vous souhaitez renforcer la sécurité de votre mot de passe, nous vous conseillons d'utiliser au minimum une lettre, un chiffre et un caractère spécial.
                    <br />
                    Le saviez-vous ? Les phrases secrètes font d'excellents mots de passe (ex : "J'ai acheté 5 CDs aujourd'hui").
                </div>
    }
}

export default PasswordAdvice;