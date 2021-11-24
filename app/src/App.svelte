<script>
  import { onMount } from "svelte";
  import Plateau from "./components/Plateau.svelte";
  import Menu from "./components/Menu.svelte";
  import { fruits } from "./lib/fruits";
  import Jeu from "./lib/jeu";

  export let apiUrl;
  let afficherTemps = true;
  let jeu;
  let tempsDeJeu;

  onMount(async () => {
    const res = await fetch(`${apiUrl}/temps-de-jeu`);
    tempsDeJeu = await res.json();
  });

  function onGagne({ detail }) {
    afficherTemps = true;
    jeu = null;
  }

  function demarrerJeu() {
    // démarrer le jeu
    jeu = new Jeu(2, fruits);
  }
</script>

<main>
  <Menu {tempsDeJeu} bind:afficher={afficherTemps} on:jouer={demarrerJeu} />

  {#if jeu}
    <Plateau bind:jeu on:gagne={onGagne} />
  {/if}
</main>
