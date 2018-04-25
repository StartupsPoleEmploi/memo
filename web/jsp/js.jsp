<!--[if lt IE 9]>
<script src="./assets/global/plugins/respond.min.js"></script>
<script src="./assets/global/plugins/excanvas.min.js"></script>
<![endif]-->

<script src="./js/jquery-2.1.3.min.js"></script>

<!---->
<!--<src>/assets/global/plugins/uniform/jquery.uniform.min.js</src>-->
<pack:script>
	<src>/js/bootstrap/bootstrap-3.3.4.min.js</src>
    <src>/assets/global/plugins/js.cookie.min.js</src>
    <src>/assets/global/plugins/bootstrap-hover-dropdown/bootstrap-hover-dropdown.min.js</src>
    <src>/assets/global/plugins/jquery-slimscroll/jquery.slimscroll.min.js</src>
    <src>/assets/global/plugins/jquery.blockui.min.js</src>
    <src>/assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js</src>
    <src>/js/tooltipster/tooltipster.bundle.min.js</src>

    <src>/js/linkifyjs/linkify.min.js</src>
    <src>/js/linkifyjs/linkify-jquery.min.js</src>
    <src>/js/pixabay/jquery.auto-complete.min.js</src>

    <src>/assets/global/plugins/jquery-validation/js/jquery.validate.min.js</src>
    <src>/assets/global/plugins/bootstrap-toastr/toastr.min.js</src>
    <src>/assets/global/scripts/app.min.js</src>
    <src>/assets/pages/scripts/login.min.js</src>
    <src>/js/Sortable.min.js</src>
    <src>/js/clipboard/clipboard.js</src>
    <src>/js/moment/momentwithlocale.js</src>
    <src>/js/eonasdandatepicker/eonasdandatepicker.js</src>
    <src>/js/utf8UrlEncoder.js</src>
    <src>/js/constantes.js</src>
    <src>/js/utils.js</src>
    <src>/js/ga.js</src>
    <src>/js/textField.js</src>
    <src>/js/classes/candidature.js</src>
    <src>/js/classes/candidatureEvent.js</src>
    <src>/js/classes/attachment.js</src>
    <src>/js/classes/conseils.js</src>
    <src>/js/classes/activites.js</src>
    <src>/js/board/parser.js</src>
    <src>/js/board/nextevents.js</src>
    <src>/js/board/form.js</src>
    <src>/js/board/files.js</src>
    <src>/js/board/timeline.js</src>
    <src>/js/board/board.js</src>
    <src>/js/board/searchTools.js</src>
    <src>/js/parametres.js</src>
    <src>/js/privacy.js</src>
    <src>/js/classes/leBonRythme.js</src>
    <src>/js/init.js</src>

    <src>/js/board/parsers/apec.js</src>
    <src>/js/board/parsers/cadremploi.js</src>
    <src>/js/board/parsers/envirojob.js</src>
    <src>/js/board/parsers/indeed.js</src>
    <src>/js/board/parsers/jobalim.js</src>
    <src>/js/board/parsers/keljob.js</src>
    <src>/js/board/parsers/labonneboite.js</src>
    <src>/js/board/parsers/leboncoin.js</src>
    <src>/js/board/parsers/linkedin.js</src>
    <src>/js/board/parsers/meteojob.js</src>
    <src>/js/board/parsers/monster.js</src>
    <src>/js/board/parsers/poleemploi.js</src>
    <src>/js/board/parsers/stepstone.js</src>
    <src>/js/board/parsers/regionsjob.js</src>
    <src>/js/board/parsers/vivastreet.js</src>
    <src>/js/board/parsers/generic.js</src>
</pack:script>

<pack:script src="/assets/global/plugins/jquery-validation/js/additional-methods.min.js" enabled="false" />

<script type="text/javascript">
    window.doorbellOptions = {
        id: '8059',
        appKey: 'Qqo79Ok0q7QmjXaeiI3nFNi87m8JPM47ChfU1Zs1BI9A8UsOdKzAOACcWuY6MDYg'
    };

	var online = isOnline();
	
	setInterval("isOnline()", 30000); // V�rification de la connexion internet toutes les 30sec

    lBR.buildPageName();

    var debugCont;

    $(document).ready(function() {
        $('.tooltipster').tooltipster({
            theme: 'tooltipster-borderless',
            debug : false,
            delay : 100
        });
    });
</script>
