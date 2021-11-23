import App from './App.svelte';

const app = new App({
	target: document.querySelector('#app'),
	props: {
		apiUrl: 'http://localhost:8000'
	}
});

export default app;
