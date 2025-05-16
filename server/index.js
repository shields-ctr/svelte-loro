import express from 'express';
import {LoroDoc, LoroMap, LoroMovableList, LoroList} from 'loro-crdt';
import ws, { WebSocketServer } from 'ws';

// The SvelteKit Node adapter provides a Express middleware handler for the app
import { handler } from '../build/handler.js';

// TODO set up a session for each client?
// https://github.com/websockets/ws/blob/master/examples/express-session-parse/index.js

//TODO draft a more semantic websocket protocol
// Initialize( id, state)
// Update( delta ) // delta contains the peerId of the emitting sender
// Save( version ) // save specified version to each clients local storage? should we just have the server save instead?
// Load( version ) // again do we just have the server provide the version or will it just be a fallback if local storage fails?
// Ping/Pong( id, version ) // since this is a realtime editor, we should probably track our users in realtime. 
//   We can also augment it with versioning information so the Server can track editing drifts...

// Initialize the Loro document
const doc = createExampleDocument();
// new LoroDoc();
// doc.setPeerId('0')
// doc.getText("text").insert(0, "Hello world!");
// doc.commit();
console.log(doc.toJSON());
console.log(doc.export({ mode: "snapshot" }));

const clients = [];
const port = 3000;

const wsServer = new WebSocketServer({ port });
wsServer.on('connection', function connection(ws, request) {
  //const ip = request.socket.remoteAddress; // these will be the same for local debugging...
  
  ws.on('message', (message)=>{
    console.log(message);
    if (message instanceof ArrayBuffer)
      broadcast(ws, new Uint8Array(message));
  });
  
  ws.on('close', function close() {
    // TODO save Loro document somewhere?
    // LevelDB? SQLite?
  })

  ws.on('error', 
    console.error
  ); // TODO probably need more cogent error handling...

  // assign the client a number 
  clients.push(ws);
  const peerId = new Uint8Array([clients.length]);
  ws.send(peerId);

  // then send the current server state
  const snapshot = doc.export({ mode: "snapshot" }); // Uint8Array
  ws.send(snapshot);
});

function broadcast(sender, message) {

  // update the server's copy of the document
  doc.import(message);

  // TODO if a client leaves then reconnects he will miss the gossip
  // that means he'll instead need an update from his version to the latest version known by the server
  // I don't think this should necessarily be the default behavior; maybe only do this update calculation
  // after detecting a disconnection via ping pong heartbeats?

  // relay the updates to each other client
  wsServer.clients.forEach(function each(client, index) {
    if (client !== sender) {
      client.send(message);
    }
  });
}

// Now serve the sveltekit app using the SvelteKit Node adapter
const app = express();
// app.use(express.static('build'));
app.use(handler);
app.listen(8080, () => {
	console.log('listening on port 8080');
});

// TODO we might send shallow snapshots if the server knows the last known client version...
// https://loro.dev/docs/tutorial/encoding#shallow-snapshot-encoding

function createExampleDocument() {
  const doc = new LoroDoc();
  const script = doc.getMovableList("script");
  addLine(script, "12:00:00.00", "Operator", "JOIN", "#namek");
  addLine(script, "12:00:01.00", "Operator", "JOIN", "#earth");
  addLine(script, "12:00:02.00", "Raditz", "JOIN", "#earth");
  addLine(script, "12:00:03.00", "Raditz", "PRIVMSG", "#earth","aaaahhhh");
  addLine(script, "12:00:04.00", "Nappa", "JOIN", "#earth");
  addLine(script, "12:00:05.00", "Vegeta", "JOIN", "#earth");
  addLine(script, "12:00:06.00", "Nappa", "PRIVMSG", "#earth","waaaaaaagh");
  addLine(script, "12:00:07.00", "Vegeta", "PRIVMSG", "#earth","haaaaaaaah");
  addLine(script, "12:00:08.00", "Ginyu", "JOIN", "#earth");
  addLine(script, "12:00:09.00", "Ginyu", "PRIVMSG", "#earth","aaaaaugh");
  addLine(script, "12:00:10.00", "Operator", "PRIVMSG", "#earth","On the next exciting episode");
  addLine(script, "12:00:11.00", "Frieza", "JOIN", "#earth");
  addLine(script, "12:00:12.00", "Frieza", "PRIVMSG", "#earth","aaaaaaaaaaaaaa");
  return doc;
}

function addLine(script, time, nick, command, ...args) {
  const line = script.insertContainer(script.length, new LoroMap());
  line.set("time", time);
  line.set("nick", nick);
  line.set("command", command);
  
  const list = line.setContainer("args", new LoroList());
  for (const arg of args) {
    list.insert(list.length, arg);
  }
}