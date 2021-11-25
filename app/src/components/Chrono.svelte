<script>
  export let tempsRestant;
  export let tempsTotal;

  function pourcentageBg(pourcentage) {
    if (pourcentage < 30) return "danger";
    if (pourcentage < 60) return "warning";
    return "success";
  }

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
