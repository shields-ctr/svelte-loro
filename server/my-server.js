
// example of providing a custom node server to SvelteKit
// https://svelte.dev/docs/kit/adapter-node#Custom-server

import { handler } from '../build/handler.js';
import express from 'express';

const app = express();

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {

	res.end('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(handler);

app.listen(8080, () => {
	console.log('listening on port 8080');
});