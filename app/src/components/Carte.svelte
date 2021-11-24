<script>
  import Fruit from "./Fruit.svelte";
  import Icone from "./Icone.svelte";

  export let indexFruit;
  export let retournee = false;

  function retournerCarte() {
    retournee = true;
  }
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a on:click={retournerCarte} class="carte {retournee ? 'retournee' : ''}">
  <div class="carte-conteneur">
    <div class="carte-avant bg-secondary text-light">
      <div class="p-3 h-100 align-items-center d-flex">
        <Icone nom={"question-circle"} />
      </div>
    </div>
    <div class="carte-arriere bg-white">
      <div class="h-100 align-items-center d-flex text-center">
        <Fruit {indexFruit} />
      </div>
    </div>
  </div>
</a>

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
