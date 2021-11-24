<script>
  import { fruits, tailleFruit, tailleImage } from "../lib/fruits";

  export let indexFruit;

  // on fait en sorte que l'index ne dépasse le nombre de fruits
  // on ne soit négatif
  indexFruit = Math.min(Math.abs(indexFruit), fruits.length - 1);

  // on calcule la position du dernier fruit
  const positionDernierFruit = tailleImage - tailleFruit;
  // on calcule la position du fruit selectionné
  const positionFruit = indexFruit * tailleFruit;
  // on calcule la position du fruit selectionné en pourcentage
  // par rapport à la position du dernier fruit
  const positionFruitPourcent = (positionFruit / positionDernierFruit) * 100;
</script>

<img
  src="/app/public/cards.png"
  alt={fruits[indexFruit]}
  style={`object-position: 0px ${positionFruitPourcent}%;`}
/>

<style>
  /**
  * Dans svelte, les styles de composants
  * ne s'appliquent qu'au composant
  */
  img {
    /**
    * La taille d'un fruit est de 100x100
    */
    max-height: 100px;
    max-width: 100px;
    /**
    * Ce paramètre permet d'adapter l'image à son conteneur,
    * la balise img, qu'elle puisse conserver ses proportions
    */
    object-fit: cover;
    width: 100%;
  }
</style>
