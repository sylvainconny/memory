<script>
  import { onMount } from "svelte";
  import Carte from "./components/Carte.svelte";
  import TempsDeJeu from "./components/TempsDeJeu.svelte";
  import { fruits } from "./lib/fruits";

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

  {#each fruits as _, i}
    <Carte indexFruit={i} />
  {/each}

  <button on:click={() => (afficherTemps = !afficherTemps)}>Afficher</button>
</main>
