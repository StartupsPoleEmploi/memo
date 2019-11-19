import isEmail from 'validator/lib/isEmail';
import isUrl from 'validator/lib/isURL';

export const maxLength = max => value => (value && value.length>max)?`Trop long (maximum ${max} car.)`:undefined;
export const minLength = min => value => (value && value.length<min)?`Trop court (minimum ${min} car.)`:undefined;
export const required = value => value ? undefined : "Requis";
export const isValidEmail = value => (value && !isEmail(value)) ? "Adresse e-mail requise" : undefined;
export const isValidPhone = value => (value && !/((?:\+|00)[17](?: |\-)?|(?:\+|00)[1-9]\d{0,2}(?: |\-)?|(?:\+|00)1\-\d{3}(?: |\-)?)?(0\d|\([0-9]{3}\)|[1-9]{0,3})(?:((?: |\-)[0-9]{2}){4}|((?:[0-9]{2}){4})|((?: |\-)[0-9]{3}(?: |\-)[0-9]{4})|([0-9]{7}))/.test(value)) ? "Numéro de téléphone requis" : undefined;
export const isRequiredValidEmail = value => value ? isValidEmail(value) : "Requis";
export const isValidUrl = value =>  (value && !isUrl(value)) ? "Veuillez renseigner une adresse Internet bien formée. Ex : https://candidat.pole-emploi.fr/offres/recherche/detail/A0CARLRJ":undefined; 
export const composeValidators = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined);
