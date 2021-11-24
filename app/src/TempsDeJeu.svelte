<script>
  export let tempsDeJeu = [];
  export let afficher = false;
</script>

<!--
  Conditionner l'affichage de la modal
  à la variable afficher
-->
<div class={`modal fade bg-secondary ${afficher ? "show d-block" : ""}`}>
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Memory</h5>
      </div>
      <div class="modal-body">
        {#if tempsDeJeu.length}
          <!--
            Si tempsDeJeu > 0
            Afficher la liste des temps de jeu
          -->
          <table class="table">
            <thead>
              <tr>
                <th>Temps</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <!--
                Liste des temps de jeu
              -->
              {#each tempsDeJeu as tps}
                <tr>
                  <td>{tps.temps_realise} secondes</td>
                  <td>{new Date(tps.date_partie).toLocaleDateString()}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else}
          <!--
            Sinon afficher un message
          -->
          <strong>Aucune partie réalisée pour le moment</strong>
        {/if}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary">
          <!--
            Afficher "Jouer" si première partie,
            "Rejouer" sinon
          -->
          {tempsDeJeu.length ? "Rejouer" : "Jouer"}
        </button>
      </div>
    </div>
  </div>
</div>
