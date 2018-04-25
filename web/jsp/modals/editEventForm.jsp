<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<div class="modal" id="mdEditEvent" tabindex="-1" role="dialog" aria-labelledby="mdEditEventDesc">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title" id="mdEditEventDesc">Modifier un événement</h4>
      </div>
      <div class="modal-body">

          <form class="form-horizontal">
              <div class="form-body">

                  <div class="form-group">
                      <label class="col-md-3 control-label" for="edEventType">Evénement </label>
                      <div class="col-md-9">
                          <select id="edEventType" class="form-control"></select>
                      </div>
                  </div>

                  <div class="form-group" id="edEventSubTypeRow">
                      <label class="col-md-3 control-label" for="edEventSubType">Type </label>
                      <div class="col-md-9">
                          <select id="edEventSubType" class="form-control"></select>
                      </div>
                  </div>
				
				<input type='hidden' id="edEventSubTypeRappel"/>
				
                  <div class="form-group">
                      <label id="labelDateEvent" class="col-md-3 control-label" for="edDateEventFC">Date</label>
                      <div class="col-md-9">
                          <div class='input-group date' id='edDateEvent'>
                            <input type='text' class="form-control" id="edDateEventFC" />
                            <span class="input-group-addon">
                                <span class="glyphicon glyphicon-calendar"></span>
                            </span>
                          </div>
                      </div>
                  </div>

                  <div class="form-group">
                      <label class="col-md-3 control-label" for="edEventComment">Commentaire </label>
                      <div class="col-md-9">
                          <textarea id="edEventComment" placeholder="Commentaire" rows="2" class="form-control"></textarea>
                      </div>
                  </div>
              </div>
          </form>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn dark btn-outline" data-dismiss="modal">Annuler</button>
        <button type="button" id="buttonEditCandidatureEvent" class="btn green">Enregistrer</button>
      </div>
    </div>
  </div>
</div>