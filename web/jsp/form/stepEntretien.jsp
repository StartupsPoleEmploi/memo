<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div id="candidatureFormStepEntretien" class="formTunnelBloc" style="display:none;">

  <div>
    <div class="pageTitle" style='white-space: normal;word-wrap: break-word;'><h1>Quel est votre entretien ?</h1></div>
    
    <div class="mt-element-step" style="width: 70%;margin: auto; margin-bottom: 20px;">
		<div class="row step-default">
	      <div class="col-md-4 bg-grey mt-step-col active" style="padding-top:7px; padding-bottom:7px;border-right: 1px solid #eef1f5;">
	          <div class="mt-step-number bg-white font-grey" style="margin: auto auto 0px;font-size:10px;padding: 3px 8px;">1</div>
	          <div class="mt-step-title font-grey-cascade" style="text-align:left;font-size:12px !important;font-weight:bold;margin-top: 5px;margin-bottom:0px;">Type de candidature</div>
	      </div>
	      <div class="col-md-2 bg-grey mt-step-col active" style="padding-top:7px; padding-bottom:7px;">
	          <div class="mt-step-number bg-white font-grey" style="margin: auto auto 0px;font-size:10px;padding: 3px 8px;">2</div>
	          <div class="mt-step-title font-grey-cascade" style="text-align:left;font-size:12px !important;font-weight:bold;margin-top: 5px;margin-bottom:0px;">Edition</div>
	      </div>
	      <div class="col-md-2 bg-grey mt-step-col active" style="padding-top:7px; padding-bottom:7px; border-right: 1px solid #eef1f5;">
	          <div class="mt-step-number bg-white font-grey" style="margin: auto auto 0px;font-size:10px;padding: 3px 8px;">3</div>
	          <div class="mt-step-title font-grey-cascade" style="text-align:left;font-size:12px !important;margin-top: 5px;margin-bottom:0px;">&nbsp;</div>
	      </div>
	      <div class="col-md-2 bg-grey mt-step-col active" style="padding-top:7px; padding-bottom:7px;">
	          <div class="mt-step-number bg-white font-grey" style="margin: auto auto 0px;font-size:10px;padding: 3px 8px;">4</div>
	          <div class="mt-step-title font-grey-cascade" style="text-align:left;font-size:12px !important;font-weight:bold;margin-top: 5px;margin-bottom:0px;">Avancement</div>
	      </div>
	      <div class="col-md-2 bg-grey mt-step-col active" style="padding-top:7px; padding-bottom:7px;">
	          <div class="mt-step-number bg-white font-grey" style="margin: auto auto 0px;font-size:10px;padding: 3px 8px;">5</div>
	          <div class="mt-step-title font-grey-cascade" style="text-align:left;font-size:12px !important;margin-top: 5px;margin-bottom:0px;">&nbsp;</div>
	      </div>
	  </div>
	</div>
		
    <p>Précisez la forme, la date et l'heure de votre entretien :</p>
  </div>

  <div>

    <div class="formBloc" >

      <div class="form-group">
        <label class="control-label" for="ftEventSubType">Forme </label>
        <div>
          <div class="input-group col-xs-12">
            <select id="ftEventSubType" class="form-control">
              <option value='1'>Entretien physique</option>
              <option value='2'>Entretien téléphonique</option>
              <option value='3'>Entretien vidéo</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="control-label" for="ftDateEventFC">Date * (obligatoire)</label>
        <div id="formTunnelDateEntretienErr" class="tfErr" style="display: none;">Vous devez renseigner une date</div>
        <div>
          <div class="input-group col-xs-12">
            <div class='input-group' id='ftDateEvent'>
              <input type='text' class="form-control" id="ftDateEventFC"/>
              <span class="input-group-addon">
                  <span class="glyphicon glyphicon-calendar"></span>
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div style="clear:both"></div>

  <div class="formButtons">
    <button type="button" class="btn btn-outline dark btnPrevious">Retour</button> <button type="button" value="3" class="saveCandidatureTunnel btn green">Enregistrer</button>
    <br /><br />
  </div>

</div>