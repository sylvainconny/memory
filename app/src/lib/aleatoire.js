export function choixAleatoires(liste, nombre) {
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
