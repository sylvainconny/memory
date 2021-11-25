export default class Jeu {
  constructor(nbCartes, fruits) {
    // on tire dans la liste des fruits la moitié du nombre de cartes
    const choixCartes = this.choixAleatoires(fruits, nbCartes);
    // on double la liste et on tire aléatoirement les cartes
    // et on créé à la volée un objet pour chaque cartes
    this.cartes = this.choixAleatoires(
      choixCartes.concat(choixCartes),
      choixCartes.length * 2
    ).map((fruit) => ({
      fruit,
      indexFruit: fruits.indexOf(fruit),
      retournee: false,
      gagnee: false,
    }));

    // statut du jeu
    this.status = {
      gagne: false,
      perdu: false
    }

    // chrono
    this.chrono = null;
  }

  demarrerChrono(fn) {
    this.chrono = setInterval(fn, 1000);
  }

  arreterChrono() {
    if (this.chrono) clearInterval(this.chrono);
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
   * Verifier status du jeu
   */
  verifierStatut() {
    // si le nombre de cartes gagnées correspond
    // au nombre de cartes total
    if (this.cartes.filter(carte => carte.gagnee).length == this.cartes.length) {
      this.status.gagne = true;
    }
    // retourne le status
    return this.status;
  }
}
