<script>
  import { fruits } from "../lib/fruits";
  import { choixAleatoires } from "../lib/aleatoire";
  import Carte from "./Carte.svelte";

  export let nbCasesX;
  export let nbCasesY;

  // on tire dans la liste des fruits la moitié du nombre de cases
  const choixFruits = choixAleatoires(fruits, (nbCasesX * nbCasesY) / 2);
  // on double la liste et on tire aléatoirement les cases
  const cases = choixAleatoires(
    choixFruits.concat(choixFruits),
    choixFruits.length * 2
  );
  console.log(cases);
</script>

<section class="min-vh-100">
  {#each Array(nbCasesY) as _, i}
    <div class="row">
      {#each Array(nbCasesX) as _, j}
        <div class="col">
          <Carte indexFruit={fruits.indexOf(cases[i * nbCasesX + j])} />
        </div>
      {/each}
    </div>
  {/each}
</section>

<style>
  div {
    border: 1px solid black;
  }
</style>
