<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div class="modal" id="mdSetEntretien" tabindex="-1" role="dialog" aria-labelledby="mdSetEntretienDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title" id="mdSetEntretienDesc">Préciser votre entretien</h4>
      </div>
      <div class="modal-body">

          <form class="form-horizontal">
              <div class="form-body">

                  <div class="form-group" id="seEventSubTypeRow">
                      <label class="col-md-3 control-label" for="seEventSubType">Forme </label>
                      <div class="col-md-9">
                          <select id="seEventSubType" class="form-control">
                              <option value='1'>Entretien physique</option>
                              <option value='2'>Entretien téléphonique</option>
                              <option value='3'>Entretien vidéo</option>
                          </select>
                      </div>
                  </div>

                  <div class="form-group">
                      <label class="col-md-3 control-label" for="seDateEventFC">Date * (obligatoire)</label>
                      <div class="col-md-9">
                          <div class='input-group date' id='seDateEvent'>
                            <input type='text' class="form-control" id="seDateEventFC" />
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-calendar"></span>
                            </span>
                          </div>
                      </div>
                  </div>

                  <div class="form-group">
                      <label class="col-md-3 control-label" for="seEventComment">Commentaire </label>
                      <div class="col-md-9">
                          <textarea id="seEventComment" placeholder="Commentaire" rows="2" class="form-control"></textarea>
                      </div>
                  </div>
              </div>
          </form>

      </div>
      <div class="modal-footer">
        <button type="button" id="buttonSetEntretien" class="btn green">Enregistrer</button>
      </div>
    </div>
  </div>
</div>