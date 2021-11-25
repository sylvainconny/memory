<script>
  import { createEventDispatcher } from "svelte";
  import { tick } from "svelte";
  import Carte from "./Carte.svelte";
  import Chrono from "./Chrono.svelte";

  // paramètre: object de classe Jeu
  export let jeu;
  // paramètre: temps imparti pour finir le jeu
  export let tempsTotal;
  // on initie le temps restant au temps total
  let tempsRestant = tempsTotal;

  // créer un nouveau type d'évènement pour jeu gagné ou perdu
  const dispatch = createEventDispatcher();
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
      // si le jeu est gagné ou perdu
      const statut = jeu.verifierStatut();
      if (statut.gagne) {
        jeu.arreterChrono();
        dispatch("gagne", {
          temps_realise: tempsTotal - tempsRestant,
        });
      }
      // on attend pour ne pas provoquer le retournement immédiat
      await tick();
      // et on cache toutes les cartes
      jeu.cacherCartes();
    }
  }

  // Chrono
  jeu.demarrerChrono(function () {
    /**
     * Sachant que la fonction setInterval est configurée
     * pour s'éxecuter toutes les 1000ms soit 1 seconde,
     * on décrémente d'un, donc d'une seconde le temps restant.
     */
    tempsRestant--;
    /**
     * Si on est arrivés à la fin du temps, on arrête le jeu
     * et on indique à l'App que le jeu est perdu.
     */
    if (tempsRestant < 1) {
      jeu.arreterChrono();
      dispatch("perdu");
    }
  });
</script>

<div class="plateau min-vh-100">
  <section class="">
    <!--
      Array(n) permet de générer un tableau de n éléments
    -->
    {#each Array(jeu.cartes.length) as _, i}
      <div>
        <Carte bind:carte={jeu.cartes[i]} on:retourner={onRetourner} />
      </div>
    {/each}
  </section>

  <Chrono {tempsTotal} {tempsRestant} />
</div>

<style>
  /**
  * 96% de l'écran pour les cartes
  * 4% pour le chrono
  */
  .plateau {
    display: grid;
    grid-template-rows: 96% 4%;
  }
  /**
  * Plateau de jeu en grille 7 par x
  */
  .plateau section {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  }

  /**
  * Affichage tablette
  */
  @media (max-width: 915px) {
    .plateau section {
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    }
  }

  /**
  * Affichage mobile
  */
  @media (max-width: 575.98px) {
    .plateau section {
      grid-template-columns: 1fr 1fr 1fr 1fr;
    }
  }
</style>
