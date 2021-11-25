import App from './App.svelte';

/**
 * Élément HTML où s'intègrera l'application
 */
const target = document.querySelector('#app');

const tempsTotal = parseInt(target.dataset.tempsTotal);
const nbCartes = parseInt(target.dataset.nbCartes);

/**
 * Point d'entrée du script js
 */
const app = new App({
	target,
	props: {
		apiUrl: target.dataset.apiUrl || 'http://localhost:8000',
		tempsTotal: tempsTotal > 0 ? tempsTotal : 200,
		nbCartes: nbCartes > 0 ? nbCartes : 14
	}
});

export default app;
