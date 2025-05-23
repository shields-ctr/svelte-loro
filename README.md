# Svelte and Loro Experiment

While learning about CRDTs(Continuously Replicated Data Types) I wanted to figure out how to incorporate them into a Svelte UI by synchronizing the replicated document with a reactive state. This proved to be non-trivial and this implementation is currently incomplete!

## Stack 
- [Vite](https://vitest.dev/guide/)
- [Node](https://nodejs.org/docs/latest/api/)
- [SvelteKit](https://svelte.dev/docs/kit/introduction)
- [Express](https://expressjs.com/)
- [Loro](https://loro.dev/) for CRDTs
- [ws](https://github.com/websockets/ws) & [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) to exchange deltas between CRDTs

### What is demonstrated;
1. A node server creates a CRDT document
1. When a client connects over `WebSocket` it is assigned an ID and given a snapshot of the document
1. The client applies the update to its local document
1. When the local document changes, a Json of the document is created and a Svelte Store is set to it
1. The svelte store updates a table-like UI

### What is missing;
- [ ] When a bound UI variable changes(ie; a user changes the text in a cell)
- [ ] A Svelte `$effect` needs to find the corresponding value in the Loro doc and update it to match
- [x] The Document observer for local changes needs to compute a delta and send it over websocket to the server
- [x] The server should apply the update to it's document
- [x] Then the server should send the update to all other clients.

### Design issues
Even if I did finish this some problems; Svelte stores do not have deep reactivity so the entire table has to be updated (granted if we use an `each` block with ids some repaint can be avoided). Going the other direction to avoid a coarse update; the effect that updates the loroDoc has to be in a cell or row sub-component which seems an awkward division... unless I'm not understanding Svelte5 snippets...

Surprisingly, prior art like **Relm**'s [svelt-yjs](https://github.com/relm-us/svelt-yjs/blob/main/src/types/array.ts) uses this coarse approach as well. Same with the [SyncedStore](https://github.com/YousefED/SyncedStore/blob/main/packages/svelte/src/index.ts) project.

### Better Approaches
What we really want is *not* to synchronize with a Svelte `Store`(since they use Svelte4's coarse, pre-compiled approach), but rather to synchronize with Svelte5's fine-grained, run-time `Runes`. These rely on Proxies to intercept mutations and invoke listeners.

One approach might be to instrument both SvelteState mutations, and LoroDoc observers to replicate changes in each other. There are some difficulties with this;
 - Loro change transactions have an undocumented structure that would have to be reverse engineered to make analogous changes in the Svelte State's POJO using some [JsonPatch-like](https://datatracker.ietf.org/doc/html/rfc6902#page-4) access
 - Loro doc snapshots can be delivered as a current state, or state and delta's. We'd also need to replicate snapshots without clobbering the State rune's proxies.
 - We'd have to find some way to Proxy each Svelte state proxy, linking it to the corresponding document container or value. This is less clear in my head since I have less experience with Js Reflection.

Definitely non-trivial. Fortunately I found one of the winners of the 2025 Svelte Society's hackathon; [SyncroState](https://syncrostate.pages.dev/). It uses `Yjs` and not `Loro` which isn't too big a deal- Yjs was actually my first choice because the environment was older and more fleshed out, the main author is a well-respected researcher and open source contributor.

> I switched to Loro when I didn't want to use the prepackaged WebSocket server because of increased complexity. And the `y-provider` interface for making your own custom providers was poorly documented. Which was a mistake; you have to figure out the server from scratch anyways with Loro...

Furthermore SyncroState also implements schema validation which should help a lot in enforcing contracts in these distributed applications.

### Next Steps
I'm just going to shelve this for now, and try again with Yjs and SyncroState. It might be worth picking this up again if Loro tips the balance.

### Note about SvelteKit & Node
To implement the websocket server I used a custom Node server. This complicates the build process and the debugging. SvelteKit's Node adapter produces a build that provides ExpressJs-flavored middleware to handle all your web app requests. You can pass this to your custom Node server that is built outside of your Sveltekit project.

To debug you spin up the dev mode(`npm run dev) then spin up your custom server(possibly in a separate debugger). They will serve on different ports so you can mix the development HMR server with your backend services.

To build for production you build SvelteKit as normal (`npm run build`) then package the build with your custom server.

Anyways, it was a bit of a pain to figure out so it's worth noting.

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
