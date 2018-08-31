<%@ page contentType="text/html;charset=UTF-8" language="java" %>


<%@ include file="./homeHeader.jsp"%>

<%@ include file="./homeConnect.jsp"%>

<%@ include file="./homeCreateAccount.jsp"%>

<%@ include file="./homeResetPassword.jsp"%>

<%@ include file="./homeForgottenPassword.jsp"%>

<div id="homePage" class="login" style="display: none">

    <div class="jumbotron bloc1">
        <div class="logo">
            <h1 class="text-center" id="pageTitle">&nbsp;</h1>
            <!--<h3 class="text-center" id="pageTagline"></h3>-->
        </div>

        <div class="text-center startButton">
            <a class="btn btn-lg green btn-rounded btnHeaderStart">
                Commencer
            </a>
        </div>

        <div>

            <div class="blocFSE">
                <img src="./pic/logo_fse.svg" alt="logo Fond Social Européen" />
                <img src="./pic/logo_pe.svg" alt="logo Pôle emploi" />
                <img src="./pic/logo_europe.svg" alt="Drapeau de l'Union Européenne" />
                <img src="./pic/texte_europe.svg" alt="Ce dispositif est cofinancé par le Fonds social européen dans le cadre du Programme opérationnel national Emploi et inclusion 2014-2020" />
            </div>


        </div>

    </div>

    <div id="bloc2" class="jumbotron bloc2">


        <div class="text-center">
            <table>
                <tr>
                    <td style="width:50px">
                        <i class="fa fa-3x fa-eye"></i>
                    </td>
                    <td>
                        <h3>J'accède à toutes mes candidatures en un clin d'&oelig;il.</h3>
                    </td>
                </tr>

                <tr>
                    <td style="width:50px">
                        <i class="fa fa-3x fa-bell-o"></i>
                    </td>
                    <td>
                        <h3>Je reçois des alertes sur ce que je dois faire cette semaine.</h3>
                    </td>
                </tr>

                <tr>
                    <td style="width:50px">
                        <i class="fa fa-3x fa-thumbs-o-up"></i>
                    </td>
                    <td>
                        <h3>Je fais la différence auprès du recruteur en suivant les conseils : relancer, se préparer à l'entretien...</h3>
                    </td>
                </tr>

            </table>

            <div class="text-center startButton">
                <a class="btn btn-lg green btn-rounded btnHeaderStart">
                    Commencer
                </a>
            </div>

        </div>

    </div>

    <div id="bloc3" class="jumbotron bloc3">

        <span id="titlebloc2"></span>

        <div class="text-center blocTitle">
            <h3 class="text-center">Comment ça marche ?</h3>
        </div>

        <div id="bloc3Video">
            <div id="videoFrame" class="youtube youtubeBg" onclick="lBR.playVideo('videoFrame','homeVideo');"></div>
        </div>

    </div>


</div>
