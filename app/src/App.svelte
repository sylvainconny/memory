<script>
  import { onMount } from "svelte";
  import TempsDeJeu from "./TempsDeJeu.svelte";

  export let apiUrl;
  let afficherTemps = false;
  let tempsDeJeu;

  onMount(async () => {
    const res = await fetch(`${apiUrl}/temps-de-jeu`);
    tempsDeJeu = await res.json();
  });

  function demarrerJeu() {
    // démarrer le jeu
    console.log("Démarrage du jeu");
  }
</script>

<main>
  <TempsDeJeu
    {tempsDeJeu}
    bind:afficher={afficherTemps}
    on:jouer={demarrerJeu}
  />

  <button on:click={() => (afficherTemps = !afficherTemps)}>Afficher</button>
</main>
