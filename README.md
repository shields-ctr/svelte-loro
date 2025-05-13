# Trying out CRDTs

## Stack 
- [Vite](https://vitest.dev/guide/)
- [Node](https://nodejs.org/docs/latest/api/)
- [SvelteKit](https://svelte.dev/docs/kit/introduction)
- [Express](https://expressjs.com/)
- [Loro](https://loro.dev/) for CRDTs
- [ws](https://github.com/websockets/ws) & [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) to exchange deltas between CRDTs
- 

## TODO
- [x] figure out to host a Svelte App on a custom Node Server
  - not worth it, there is still no build/test integration. Better off just hosting separately. But at least I know how to do this deployment option.
- [ ] Figure out delta protocol.
- [ ] Eventually should put the bots in [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
- [ ] right now the server just assigns an ID, but we might want to have the user authenticate a session.
  - https://github.com/websockets/ws/blob/master/examples/express-session-parse/index.js

# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
