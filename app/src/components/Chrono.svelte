<script>
  /**
   * chronomètre qui s'affiche en bas de l'écran
   */

  // paramètre: le temps qu'il reste pour finir le jeu
  export let tempsRestant;
  // paramètre: le temps initial donné pour finir le jeu
  export let tempsTotal;

  // permet un affichage différencié selon le temps restant
  function pourcentageBg(pourcentage) {
    if (pourcentage < 30) return "danger";
    if (pourcentage < 60) return "warning";
    return "success";
  }

  /**
   * On utilise une barre de progression pour représenter le chronomètre.
   * On doit donc convertir le temps restant en pourcentage pour
   * afficher correctement la barre.
   *
   * Le fait d'utiliser $: dans svelte signifie que cette variable
   * se mettra à jour à chaque fois que les variables tempsRestant et tempsTotal
   * qui composent son calcul seront mises à jour.
   */
  $: pourcentage = (tempsRestant / tempsTotal) * 100;
</script>

<div class="progress h-100 rounded-0">
  <div
    class="progress-bar bg-{pourcentageBg(pourcentage)}"
    role="progressbar"
    aria-valuenow={pourcentage}
    aria-valuemin="0"
    aria-valuemax="100"
    style="width: {pourcentage}%"
  >
    {tempsRestant}s
  </div>
</div>
