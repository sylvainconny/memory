<script>
  import { createEventDispatcher } from "svelte";
  import Fruit from "./Fruit.svelte";
  import Icone from "./Icone.svelte";

  // paramètre: données de la carte
  export let carte;

  // créer un nouveau type d'évènement pour retourner une carte
  const dispatch = createEventDispatcher();
  function retournerCarte() {
    /**
     * Si la carte n'est ni gagnée ni déjà retournée,
     * on la retourne et on envoie un évènement au composant parent
     */
    if (!carte.gagnee && !carte.retournee) {
      carte.retournee = true;
      dispatch("retourner");
    }
  }
</script>

{#if carte}
  <!-- svelte-ignore a11y-missing-attribute -->
  <a
    on:click={retournerCarte}
    class="carte {carte.gagnee || carte.retournee ? 'retournee' : ''}"
  >
    <div class="carte-conteneur">
      <div class="carte-avant bg-primary text-light">
        <div class="p-3 h-100 align-items-center d-flex">
          <!-- icone point d'interrogation -->
          <Icone nom={"question-circle"} />
        </div>
      </div>
      <div class="carte-arriere bg-white">
        <div class="h-100 align-items-center d-flex text-center">
          <!-- image de fruit -->
          <Fruit indexFruit={carte.indexFruit} />
        </div>
      </div>
    </div>
  </a>
{/if}

<style>
  /**
  * Source: https://www.w3schools.com/howto/howto_css_flip_card.asp
  */
  .carte {
    background-color: transparent;
    width: 100%;
    height: 100%;
    min-height: 100px;
    border: 1px solid #f1f1f1;
    perspective: 1000px;
    display: block;
  }

  .carte-conteneur {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .carte.retournee .carte-conteneur {
    transform: rotateY(180deg);
  }

  .carte-avant,
  .carte-arriere {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  .carte-arriere {
    transform: rotateY(180deg);
  }
</style>
