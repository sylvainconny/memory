<script>
  import { onMount } from "svelte";
  import TempsDeJeu from "./TempsDeJeu.svelte";

  export let apiUrl;
  let afficherTemps = true;
  let tempsDeJeu;

  onMount(async () => {
    const res = await fetch(`${apiUrl}/temps-de-jeu`);
    tempsDeJeu = await res.json();
  });
</script>

<main>
  <TempsDeJeu {tempsDeJeu} bind:afficher={afficherTemps} />

  <button on:click={() => (afficherTemps = !afficherTemps)}>Afficher</button>
</main>
