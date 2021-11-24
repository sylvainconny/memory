<script>
  import { fruits } from "../lib/fruits";
  import Jeu from "../lib/jeu";
  import Carte from "./Carte.svelte";

  export let nbCartes;

  const jeu = new Jeu(nbCartes, fruits);
</script>

<section class="min-vh-100">
  {#each Array(nbCartes) as _, i}
    <div>
      <Carte
        bind:carte={jeu.cartes[i]}
        on:retourner={() => jeu.onRetourner()}
      />
    </div>
  {/each}
</section>

<style>
  /**
  * Plateau de jeu en grille 7 par x
  */
  section {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  }

  /**
  * Affichage tablette
  */
  @media (max-width: 915px) {
    section {
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    }
  }

  /**
  * Affichage mobile
  */
  @media (max-width: 575.98px) {
    section {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }
  }
</style>
