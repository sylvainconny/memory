<script>
  import { fruits } from "../lib/fruits";
  import { sleep } from "../lib/sleep";
  import { choixAleatoires } from "../lib/aleatoire";
  import Carte from "./Carte.svelte";

  export let nbCasesX;
  export let nbCasesY;

  // on tire dans la liste des fruits la moitié du nombre de cartes
  const choixFruits = choixAleatoires(fruits, (nbCasesX * nbCasesY) / 2);
  // on double la liste et on tire aléatoirement les cartes
  const cartes = choixAleatoires(
    choixFruits.concat(choixFruits),
    choixFruits.length * 2
  )
    // on créé à la volée un objet pour chaque cartes
    .map((fruit) => ({
      fruit,
      indexFruit: fruits.indexOf(fruit),
      retournee: false,
      gagnee: false,
    }));

  /**
   * À chaque fois qu'une carte est retournée
   */
  async function onRetourner() {
    // on récupère les cartes retournées
    const cartesRetournees = cartes.filter((carte) => carte.retournee);
    // le nombre de cartes retournées
    const nbCartesRetournees = cartesRetournees.length;
    // s'il y a 2 cartes retournées
    if (nbCartesRetournees == 2) {
      // si ce sont les mêmes
      if (cartesRetournees[0].indexFruit == cartesRetournees[1].indexFruit) {
        gagnerCarte(cartesRetournees[0].indexFruit);
      }
      // on attend que l'animation se fasse
      await sleep(500);
      // et on cache toutes les cartes
      cacherCartes();
    }
  }

  /**
   * Dans le cas où les cartes sont les mêmes
   */
  function gagnerCarte(indexFruit) {
    for (let i = 0; i < cartes.length; i++) {
      if (cartes[i].indexFruit == indexFruit) {
        cartes[i].gagnee = true;
      }
    }
  }

  /**
   * Cacher toutes les cartes
   */
  function cacherCartes() {
    for (let i = 0; i < cartes.length; i++) {
      cartes[i].retournee = false;
    }
  }
</script>

<section class="min-vh-100">
  {#each Array(nbCasesX * nbCasesY) as _, i}
    <div>
      <Carte bind:carte={cartes[i]} on:retourner={onRetourner} />
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
