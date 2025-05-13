<script>
  import {LoroDoc} from 'loro-crdt';
    
  // NOTE if we use IndexedDB then we need to have a naming/versioning scheme to determine which clients have which versions of which documents, so we don't all clobber each other.
  const doc = new LoroDoc();
  const port = 3000;
  const socket = new WebSocket(`ws://localhost:${port}`);
  let id
  let count = 0;
  let version = doc.version();

  socket.addEventListener('open', function (event) {
    console.log('Connected');
  });

  socket.addEventListener('message', function (event) {
    console.log(event.data)
    const message = JSON.parse(event.data);
    console.log(message);
    
    // the first message assigns a unique id and provides the initial document state.
    if (count++ === 0) {
      doc.setPeerId(message.id);
      doc.import(message.state);
    }
    // subsequent messages are updates
    else {
      doc.import(message);
    }

    console.log(doc.toJSON());
    
    // update the version
    version = doc.version();
    // TODO we don't want these imported changes to be broadcast
    // so we need to make sure the document change listener doesn't fire after imported updates...
    
  });

  // doc.subscribe((event) => {
  //   console.log(event);
  //   let update = doc.export({ mode: "update", from: version });
  //   version = doc.version();
  //   socket.send(update);
  // });

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
