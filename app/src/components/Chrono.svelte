<script>
  import { createEventDispatcher } from "svelte";

  export let tempsTotal;

  function pourcentageBg(pourcentage) {
    if (pourcentage < 30) return "danger";
    if (pourcentage < 60) return "warning";
    return "success";
  }

  // créer un nouveau type d'évènement pour chrono terminé
  const dispatch = createEventDispatcher();

  let tempsRestant = tempsTotal;
  $: pourcentage = (tempsRestant / tempsTotal) * 100;

  const interval = setInterval(aChaqueSeconde, 1000);
  function aChaqueSeconde() {
    tempsRestant--;
    if (tempsRestant < 1) {
      clearInterval(interval);
      dispatch("tempsecoule");
    }
  }
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
