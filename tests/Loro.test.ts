import {expect, test} from 'vitest';
import {LoroDoc, LoroList, LoroMap, LoroText} from 'loro-crdt';

// Examples taken from; https://loro.dev/docs/tutorial/get_started

test('syncing simultaneous edits', ()=>{
  const docA = new LoroDoc();
  const docB = new LoroDoc();
  
  //...operations on docA and docB
  // TODO
  
  // Assume docA and docB are two Loro documents in two different devices
  const bytesA = docA.export({ mode: "update" });
  // send bytes to docB by any method
  docB.import(bytesA);
  // docB is now updated with all the changes from docA
  
  const bytesB = docB.export({ mode: "update" });
  // send bytes to docA by any method
  docA.import(bytesB);
  // docA and docB are now in sync, they have the same state
  
});

test('Save State', ()=>{

  // Saving documents
  const doc = new LoroDoc();
  doc.getText("text").insert(0, "Hello world!");
  const bytes = doc.export({ mode: "snapshot" });
  // Bytes can be saved to local storage, database, or sent over the network

  // Loading documents
  const newDoc = new LoroDoc();
  newDoc.import(bytes);

  // Versioning?
  // doc.checkout(version); // Checkout the doc to the given version

  // Converting to JSON
  newDoc.toJSON();
});

test('Data Structures', ()=>{
  const doc = new LoroDoc();
  const list: LoroList = doc.getList("list");
  list.insert(0, "A");
  list.insert(1, "B");
  list.insert(2, "C");
  
  const map: LoroMap = doc.getMap("map");
  // map can only has string key
  map.set("key", "value");
  expect(doc.toJSON()).toStrictEqual({
    list: ["A", "B", "C"],
    map: { key: "value" },
  });
  
  // delete 2 element at index 0
  list.delete(0, 2);
  expect(doc.toJSON()).toStrictEqual({
    list: ["C"],
    map: { key: "value" },
  });
  
  // Insert a text container to the list
  const text = list.insertContainer(0, new LoroText());
  text.insert(0, "Hello");
  text.insert(0, "Hi! ");
  
  expect(doc.toJSON()).toStrictEqual({
    list: ["Hi! Hello", "C"],
    map: { key: "value" },
  });
  
  // Insert a list container to the map
  const list2 = map.setContainer("test", new LoroList());
  list2.insert(0, 1);
  expect(doc.toJSON()).toStrictEqual({
    list: ["Hi! Hello", "C"],
    map: { key: "value", test: [1] },
  });
});

test('Incremental Versions', ()=>{
  const doc = new LoroDoc();
  doc.getText("text").insert(0, "Hello world!");
  const data = doc.export({ mode: "snapshot" });
  let lastSavedVersion = doc.version();
  doc.getText("text").insert(0, "✨");
  const update0 = doc.export({ mode: "update", from: lastSavedVersion });
  lastSavedVersion = doc.version();
  doc.getText("text").insert(0, "😶‍🌫️");
  const update1 = doc.export({ mode: "update", from: lastSavedVersion });
  
  {
    /**
     * You can import the snapshot and the updates to get the latest version of the document.
     */
  
    // import the snapshot
    const newDoc = new LoroDoc();
    newDoc.import(data);
    expect(newDoc.toJSON()).toStrictEqual({
      text: "Hello world!",
    });
  
    // import update0
    newDoc.import(update0);
    expect(newDoc.toJSON()).toStrictEqual({
      text: "✨Hello world!",
    });
  
    // import update1
    newDoc.import(update1);
    expect(newDoc.toJSON()).toStrictEqual({
      text: "😶‍🌫️✨Hello world!",
    });
  }
  
  {
    /**
     * You may also import them in a batch
     */
    const newDoc = new LoroDoc();
    newDoc.importUpdateBatch([update1, update0, data]);
    expect(newDoc.toJSON()).toStrictEqual({
      text: "😶‍🌫️✨Hello world!",
    });
  }
});

test('Sync State', ()=>{
  const docA = new LoroDoc();
  const docB = new LoroDoc();
  const listA: LoroList = docA.getList("list");
  listA.insert(0, "A");
  listA.insert(1, "B");
  listA.insert(2, "C");
  // B import the ops from A
  const data: Uint8Array = docA.export({ mode: "update" });
  // The data can be sent to B through the network
  docB.import(data);
  expect(docB.toJSON()).toStrictEqual({
    list: ["A", "B", "C"],
  });
  
  const listB: LoroList = docB.getList("list");
  listB.delete(1, 1);
  
  // `doc.export({mode: "update", from: version})` can encode all the ops from the version to the latest version
  // `version` is the version vector of another document
  const missingOps = docB.export({
    mode: "update",
    from: docA.oplogVersion(),
  });
  docA.import(missingOps);
  
  expect(docA.toJSON()).toStrictEqual({
    list: ["A", "C"],
  });
  expect(docA.toJSON()).toStrictEqual(docB.toJSON());
});

test('Event Listener', async ()=>{
  // The code is from https://github.com/loro-dev/loro-examples-deno
  const doc = new LoroDoc();
  const text = doc.getText("text");
  text.insert(0, "Hello world!");
  doc.commit();
  let ran = false;
  text.subscribe((e) => {
    for (const event of e.events) {
      if (event.diff.type === "text") {
        expect(event.diff.diff).toStrictEqual([
          {
            retain: 5,
            attributes: { bold: true },
          },
        ]);
        ran = true;
      }
    }
  });
  text.mark({ start: 0, end: 5 }, "bold", true);
  doc.commit();
  await new Promise((r) => setTimeout(r, 1));
  expect(ran).toBeTruthy();
})