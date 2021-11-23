<script>
  import { onMount } from "svelte";

  export let apiUrl;
  let tempsDeJeu = [];
  onMount(async () => {
    const res = await fetch(`${apiUrl}/temps-de-jeu`);
    tempsDeJeu = await res.json();
  });
</script>

<main>
  <div>
    Précédents temps de jeu
    {#each tempsDeJeu as tps}
      <p>{tps}</p>
    {/each}
  </div>
</main>
