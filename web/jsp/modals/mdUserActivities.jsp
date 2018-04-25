<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="modal" id="mdUserActivities" tabindex="-1" role="dialog" aria-labelledby="Activitié de l'utilisateur">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Activité de l'utilisateur <b><span id="userIdLabel"></span></b></h4>
      </div>
      <div class="modal-body">

        <div id="userActivityArray" style="max-height: 500px; overflow: auto;"></div>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn dark btn-outline" data-dismiss="modal">Fermer</button>
      </div>
    </div>
  </div>
</div>