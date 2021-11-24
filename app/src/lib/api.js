export default class Api {

  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async getTempsDeJeu() {
    const res = await fetch(`${this.apiUrl}/temps-de-jeu`);
    return await res.json();
  }

  async setTempsDeJeu(temps_realise) {
    return await fetch(`${this.apiUrl}/temps-de-jeu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ temps_realise }),
    });
  }
}
