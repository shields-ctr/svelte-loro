<script lang="ts">
  import {LoroDoc} from 'loro-crdt';
    
  // NOTE if we use IndexedDB then we need to have a naming/versioning scheme to determine which clients have which versions of which documents, so we don't all clobber each other.
  const doc = new LoroDoc();
  const port = 3000;
  const socket = new WebSocket(`ws://localhost:${port}`);
  socket.binaryType = 'arraybuffer';

  let id = 0;
  // let version = doc.version();

  socket.addEventListener('open', function (event) {
    console.log('Connected');
  });

  socket.addEventListener('message', async function (event) {
    // Debug
    console.log(event.timeStamp, event.origin, event.lastEventId, event.type, event.data);

    const bytes = new Uint8Array(event.data);
    console.log(bytes);

    // the first message from our server is the peerId for this client
    if (id==0) {
      id = bytes[0];
      doc.setPeerId(id);
      console.log('id',id);
    }

    // subsequent messages contain either updates or snapshots
    else {
      doc.import(bytes);
      // Debug
      await Promise.resolve();
      console.log('doc', doc.toJSON());
    }
    
    // NOTE: eventually we might have some persisted local state.
    // In which case it is the user who needs to tell the server who they are, and what document they are working on.
    // The server need to reply with a the document state and any edits since the user has been disconnected.
    // Possibly, the client has local edits while disconnected, these should also be relayed at some point.
    // not entirely sure in what order or what kind of protocol this should be done...
    // track the version?
    // version = doc.version();
  });

  // TODO we don't want these imported changes to be broadcast
  // so we need to make sure the document change listener doesn't fire after imported updates...
  // doc.subscribe((event) => {
  //   console.log(event);
  //   let update = doc.export({ mode: "update", from: version });
  //   version = doc.version();
  //   socket.send(update);
  // });

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
