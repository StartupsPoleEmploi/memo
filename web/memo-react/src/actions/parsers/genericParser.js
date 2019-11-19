import Candidature from '../../classes/candidature';
import { getTextNodesIn, $sc, $rBR, $rNBSP, $rIMG, $rHx, $rP, $rSPAN} from '../../components/utils';
import $ from 'jquery';

class GenericParser{
    
    name = "";
    logo = "";
    isGeneric = 1;

    parse = function(html) {
        var c = new Candidature(),
            cont = $("#importContainer");

        html = $sc(html);   // suppression des scripts
        html = $rIMG(html); // des balises img
        html = $rBR(html);  // remplacement des br par des \n
        html = $rP(html);   // idem pour le p
        html = $rNBSP(html);    // remplacement des &nbsp par des espaces

        cont.html(html);

        c.nomCandidature = this.findTitle(cont);    // extraction du titre

        html = $rHx(html);  // suppression des tags <hX>txt</hX> remplacés par des \ntxt\n

        cont.html(html);

        //html = $rSPAN(html);
        html = $rSPAN("#importContainer");  // suppression des tags span avec conservation du contenu

        c.description = this.getTxtNodes(); // extraction du texte

        return c;
    }

    findTitle = cont =>
    {
        var tit="",
            cT = "",
            h1s = cont.find("h1");

        for(let i=0;i<h1s.length; ++i)
        {
            cT = $(h1s[i]).text().trim();
            if(!tit && cT)
                tit = cT;
        }

        if(!tit)
        {
            var h0 = cont.find("h0");
            if(h0.length>0)
                tit=$(h0[0]).text().trim();
        }

        return tit;
    }

    getTxtNodes = () =>
    {
        var txtNodes = getTextNodesIn(document.getElementById("importContainer")),
            l = txtNodes.length;

        var d ="";

        if(l>0)
        {
            for(var i = 0; i<l; ++i)
            {
                var tN = $(txtNodes[i]);

                var txt = tN.text().trim();
                if (txt.length > 40)
                    d+=txt+"\n\n";
            }
        }

        return d;
    }
}
export default GenericParser;