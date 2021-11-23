<script>
  import { onMount } from "svelte";

  export let apiUrl;
  let tempsDeJeu = [];
  onMount(async () => {
    const res = await fetch(`${apiUrl}/temps-de-jeu`);
    tempsDeJeu = await res.json();
  });
</script>

<main>
  <div>
    Précédents temps de jeu
    <table class="table">
      <thead>
        <tr>
          <th>Temps</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {#each tempsDeJeu as tps}
          <tr>
            <td>{tps.temps_realise} secondes</td>
            <td>{new Date(tps.date_partie).toLocaleDateString()}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</main>
