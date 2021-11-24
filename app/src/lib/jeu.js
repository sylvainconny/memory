export default class Jeu {
  constructor(nbCartes, fruits) {
    // on tire dans la liste des fruits la moitié du nombre de cartes
    const choixCartes = this.choixAleatoires(fruits, nbCartes);
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
   * Retourne les cartes retournées
   */
  cartesRetournees() {
    return this.cartes.filter((carte) => carte.retournee);
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

  /**
   * Si le jeu est gagné
   */
  jeuGagne() {
    return (this.cartes.filter(carte => carte.gagnee).length == this.cartes.length);
  }
}
