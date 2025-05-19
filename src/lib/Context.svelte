<script lang="ts">
  import {setContext} from 'svelte';
  import {LoroDoc, type LoroEvent, type LoroEventBatch} from 'loro-crdt';

  // the way to do slots in Svelte5?
  let {children} = $props();

  // Set up a Svelte application state in the context, which will be synced with the document
  let script:{id:number, time:string, nick:string, command:string, args:string[]}[] = $state([]);
  setContext('script', script);

  // Set up a local replica of the application document in the context
  let id = 0;
  const doc = new LoroDoc();
  setContext('doc', doc);

  // For every document update, update the corresponding state
  const list = doc.getMovableList('script');
  list.subscribe((transaction:LoroEventBatch) => {
    console.log('list', transaction, doc.toJSON());

    // change structure that I observed;
    // all lines are added to the script
    // all primitive fields are added to the lines
    // all argument lists are added to the lines
    // in other words it build the tree from the top down.
    // list.

    // TODO try applying the changes individually to avoid an entire app repaint every key stroke...
    // for (const event of transaction.events) {
    //   if (event.path?.[0] === 'script') {
    //     if (event.diff)
    //   }
    // }
    
    // Or we might figure out how to turn the old state into the new document json
    // let updated = doc.toJSON().script;
    // for ( const old of script ) {
    //   for ( const nuu of updated ) {
        
    //   }
    // }

    // Ain't nobody got time for that
    script.push( ...(doc.toJSON().script));
    console.log('updated script', $state.snapshot(script));
    // TODO figure out how to interpret document updates and copy them to the svelte state...
  });

  // connect a websocket to the server which will be used to relay document updates
  const port = 3000;
  const socket = new WebSocket(`ws://localhost:${port}`);
  socket.binaryType = 'arraybuffer';

  socket.addEventListener('open', function (event) {
    console.log('Connected');
  });

  socket.addEventListener('message', async function (event) {
    const bytes = new Uint8Array(event.data);
    // console.log(event.timeStamp, event.origin, event.lastEventId, event.type, bytes);

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
      // await Promise.resolve();
      // console.log('doc', doc.toJSON());
    }
    
    // NOTE: eventually we might have some persisted local state.
    // In which case it is the user who needs to tell the server who they are, and what document they are working on.
    // The server need to reply with a the document state and any edits since the user has been disconnected.
    // Possibly, the client has local edits while disconnected, these should also be relayed at some point.
    // not entirely sure in what order or what kind of protocol this should be done...
    // track the version?
    // version = doc.version();
  });

  // When 
  $effect(() => {
    console.log(script);
  });

  // For every local change, send the updates to the server
  doc.subscribeLocalUpdates((updates) => {
    // let update = doc.export({ mode: "update", from: version });
    // version = doc.version(); // this stuff is all automatically updated no need for me to do it...
    console.log('sending updates to server', updates);
    socket.send(updates);
  });
</script>

{@render children?.()}