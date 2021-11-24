<script>
  import { tick } from "svelte";
  import Carte from "./Carte.svelte";

  export let jeu;

  /**
   * À chaque fois qu'une carte est retournée
   */
  async function onRetourner() {
    // on récupère les cartes retournées
    const cartesRetournees = jeu.cartesRetournees();
    // le nombre de cartes retournées
    const nbCartesRetournees = cartesRetournees.length;
    // s'il y a 2 cartes retournées
    if (nbCartesRetournees == 2) {
      // si ce sont les mêmes
      if (cartesRetournees[0].indexFruit == cartesRetournees[1].indexFruit) {
        jeu.gagnerCarte(cartesRetournees[0].indexFruit);
      }
      // si le jeu est gagné
      if (jeu.jeuGagne()) {
        alert("Jeu gagné !");
      }
      // on attend pour ne pas provoquer le retournement immédiat
      await tick();
      // et on cache toutes les cartes
      jeu.cacherCartes();
    }
  }
</script>

<section class="min-vh-100">
  {#each Array(jeu.cartes.length) as _, i}
    <div>
      <Carte bind:carte={jeu.cartes[i]} on:retourner={onRetourner} />
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
