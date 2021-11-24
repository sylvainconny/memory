export default class Api {

  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  /**
   * Liste les temps de jeu
   * Fait appel à la base de données
   * via les scripts php
   */
  async listeTempsDeJeu() {
    const res = await fetch(`${this.apiUrl}/temps-de-jeu`);
    return await res.json();
  }

  /**
   * Ajouter un temps de jeu
   * Écrit dans la base de données
   * via les scripts php
   */
  async ajouterTempsDeJeu(temps_realise) {
    return await fetch(`${this.apiUrl}/temps-de-jeu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ temps_realise }),
    });
  }
}
