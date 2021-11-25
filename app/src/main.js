import App from './App.svelte';

/**
 * Point d'entrée du script js
 */
const app = new App({
	target: document.querySelector('#app'),
	props: {
		apiUrl: 'http://localhost:8000'
	}
});

export default app;
