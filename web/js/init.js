var lBR = new leBonRythme();

$(document).ready(function(){

    $.ajaxSetup({ cache: false });

    lBR.init();
    if(memoVars.uLI)
        lBR.initBoard();
    if(memoVars.isVisitor)
        lBR.buildVisitorDisplay();
});
