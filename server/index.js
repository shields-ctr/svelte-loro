import * as Y from 'yjs';
import {WebsocketProvider } from 'y-websocket';
import ws from 'ws';

const doc = new Y.Doc();

const wsProvider = new WebsocketProvider(
  'ws://localhost:1234', 'my-roomname',
  doc,
  {WebSocketPolyfill: ws}
)

wsProvider.on('status', event => {
  console.log(event.status)
});

//oh wait; this is not server code..
// you spin up a central socket server provided by Yjs? 