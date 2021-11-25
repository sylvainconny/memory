<script>
  import { onMount } from "svelte";
  import Plateau from "./components/Plateau.svelte";
  import Menu from "./components/Menu.svelte";
  import { fruits } from "./lib/fruits";
  import Jeu from "./lib/jeu";
  import Api from "./lib/api";

  export let apiUrl;
  let afficherMenu = true;
  let messageMenu = {
    texte: "",
    classe: "",
  };
  let jeu;
  let tempsDeJeu;

  const api = new Api(apiUrl);

  /**
   * Au démarrage de l'application,
   * on charge les temps précédents
   */
  onMount(async () => {
    tempsDeJeu = await api.listeTempsDeJeu();
  });

  /**
   * Quand le jeu est gagné
   */
  async function onGagne({ detail }) {
    const res = await api.ajouterTempsDeJeu(detail.temps_realise);
    // si la requête a échoué
    if (res.status != 200) {
      // on affiche le message d'erreur
      alert(res.statusText);
      return;
    }
    // on recharge les temps de jeu
    tempsDeJeu = await api.listeTempsDeJeu();
    // on personnalise le message du menu
    messageMenu = {
      texte: `C'est gagné !`,
      classe: "alert alert-success",
    };
    afficherMenu = true;
    // on supprime le jeu
    jeu = null;
  }

  function onPerdu() {
    // on personnalise le message du menu
    messageMenu = {
      texte: `Game Over`,
      classe: "alert alert-danger",
    };
    afficherMenu = true;
    // on supprime le jeu
    jeu = null;
  }

  function demarrerJeu() {
    // démarrer le jeu
    jeu = new Jeu(14, fruits);
  }
</script>

<main>
  <Menu
    {tempsDeJeu}
    message={messageMenu}
    bind:afficher={afficherMenu}
    on:jouer={demarrerJeu}
  />

  {#if jeu}
    <Plateau bind:jeu tempsTotal={200} on:gagne={onGagne} on:perdu={onPerdu} />
  {/if}
</main>
