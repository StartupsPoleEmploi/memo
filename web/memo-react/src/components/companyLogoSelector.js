import React, { useState } from "react";
import { MEMO } from "../index";
import Tippy from '@tippy.js/react';
import Downshift from "downshift";
import { getLogosFromCompanyName } from "../actions/importActions";
import { changeHistoryState } from "../pages/newCandidature/newCandidatureForm";

const itemToString = item => (item ? item : "");

//const DownShiftInput = ({ input, meta, label, items, ...rest }) => 
const CompanyLogoSelector = ({ input, meta, label, logoUrl, formType, /*items,*/ ...rest }) => 
{
    //console.log("FORMTYPE : ",formType);

    const [items, setItems] = useState([]);
    const [formLogoUrl, setFormLogoUrl] = useState(logoUrl);

    
    const getItems = async companyName => {
        if(companyName)
            setItems(await getLogosFromCompanyName(companyName));
        else
            setItems([]);
    }

    // appelle le service clearbit pour avoir les propositions de noms d'entreprise + logo
    const handleChange = e => {
        getItems(e.target.value);        

        if(formType)
            changeHistoryState("nomSociete",e.target.value);
    }

    // ajoute un traitement sur l'élément sélectionné lors de la sélection d'une société proposé
    // dans la combo de l'auto completer
    // Fixe l'adresse du logo dans la variable globale MEMO.formLogoUrl utilisée lors de l'enregistrement de la candidature
    // Répercute ce logo dans le state du component pour l'affichage sous le champ 
    const handleSelect = (selectedItem) => 
    {
        //console.log("selectedItem ",selectedItem," ----- ",items);
        if(selectedItem && items)
        {
            for(let i=0; i<items.length; ++i)
            {
                if(items[i].name==selectedItem)
                {
                    if(formType)
                    {
                        changeHistoryState("nomSociete",selectedItem);
                        changeHistoryState("logoUrl",items[i].logo);
                    }
                    else
                        MEMO.formLogoUrl = items[i].logo;
                    setFormLogoUrl(items[i].logo)
                    break;
                }
            }
        }
    }

    // appelé lorsque l'utilisateur supprimer le logo
    const handleRemoveLogo = e =>
    {
        e.stopPropagation();
        setFormLogoUrl("");
        MEMO.formLogoUrl = "";
    }
    
    return <Downshift
        {...input}
        onInputValueChange={(inputValue) => {
        input.onChange(inputValue);
        }}
        itemToString={itemToString}
        selectedItem={input.value}
        onSelect={handleSelect}
    >
        {({
        getInputProps,
        getItemProps,
        getLabelProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem
        }) => {
        
        //console.log("getInputProps : ",getInputProps());
            
        return (
            <div className='candidatureField' >
            <div style={{ position: "relative" }}>
                {formType?<div className="newCandidatureFieldLabel">Nom de la société</div>:<i className="fal fa-building"></i>}
                <input
                {...getInputProps({
                    name: input.name
                })}
                /*onChange={onChange}*/
                {...getInputProps({onChange: handleChange})}
                />
                {formLogoUrl && (
                    <div className='formLogo'>
                        <img src={formLogoUrl} />
                        <Tippy content="Supprimer le logo" animation='shift-toward' placement="top" duration={[0,0]} trigger="mouseenter focus">
                            <button type='button' className='modalClose' onClick={handleRemoveLogo}><i className='fal fa-times'></i></button>
                        </Tippy>
                    </div>
                )}
                {isOpen &&
                !!items.length && (
                    <div
                        className='logoSelector'
                    style={{
                        background: "white",
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        zIndex: 4
                    }}
                    >
                    {items.map((item, index) => (
                        <div
                        {...getItemProps({
                            key: index,
                            index,
                            item:item.name,
                            style: {
                            backgroundColor:
                                highlightedIndex === index ? "lightgray" : "white",
                            fontWeight: selectedItem === item ? "bold" : "normal"
                            }
                        })}
                        >
                            <img src={item.logo} />
                            {item.name}
                            {item.domain?"("+item.domain+")":""}
                        </div>
                    ))}
                    </div>
                )}
            </div>
            </div>
        );
        }}
    </Downshift>
};


export default CompanyLogoSelector;
