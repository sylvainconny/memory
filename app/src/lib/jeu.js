import { sleep } from "./sleep";

export default class Jeu {
  constructor(nbCartes, fruits) {
    // on tire dans la liste des fruits la moitié du nombre de cartes
    const choixCartes = this.choixAleatoires(fruits, nbCartes / 2);
    // on double la liste et on tire aléatoirement les cartes
    this.cartes = this.choixAleatoires(
      choixCartes.concat(choixCartes),
      choixCartes.length * 2
    )
      // on créé à la volée un objet pour chaque cartes
      .map((fruit) => ({
        fruit,
        indexFruit: fruits.indexOf(fruit),
        retournee: false,
        gagnee: false,
      }));
  }

  /**
   * Choisir un nombre d'éléments dans une liste
   */
  choixAleatoires(liste, nombre) {
    // on copie la liste
    const listeCopie = liste.slice();
    // on créer le tableau des choix
    let choix = [];
    for (let i = 0; i < nombre; i++) {
      // on choisit aléatoirement l'index d'un élément de la liste copiée
      const indexAléatoire = Math.floor(Math.random() * listeCopie.length);
      // on prélève cet élément de la liste copiée
      const elementPreleve = listeCopie.splice(indexAléatoire, 1);
      // on ajoute cet élément aux choix
      choix = choix.concat(elementPreleve);
    }
    return choix;
  }

  /**
   * À chaque fois qu'une carte est retournée
   */
  async onRetourner() {
    // on récupère les cartes retournées
    const cartesRetournees = this.cartes.filter((carte) => carte.retournee);
    // le nombre de cartes retournées
    const nbCartesRetournees = cartesRetournees.length;
    // s'il y a 2 cartes retournées
    if (nbCartesRetournees == 2) {
      // si ce sont les mêmes
      if (cartesRetournees[0].indexFruit == cartesRetournees[1].indexFruit) {
        this.gagnerCarte(cartesRetournees[0].indexFruit);
      }
      // on attend pour ne pas provoquer le retournement immédiat
      await sleep(1);
      // et on cache toutes les cartes
      this.cacherCartes();
    }
  }

  /**
   * Dans le cas où les cartes sont les mêmes
   */
  gagnerCarte(indexFruit) {
    for (let i = 0; i < this.cartes.length; i++) {
      if (this.cartes[i].indexFruit == indexFruit) {
        this.cartes[i].gagnee = true;
      }
    }
  }

  /**
   * Cacher toutes les cartes
   */
  cacherCartes() {
    for (let i = 0; i < this.cartes.length; i++) {
      this.cartes[i].retournee = false;
    }
  }
}
