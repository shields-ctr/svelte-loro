import {LoroDoc, LoroList, LoroMap, LoroText} from 'loro-crdt';
// import {expect} from 'vitest';
// Examples taken from; https://loro.dev/docs/tutorial/get_started

export function LoroExample() {
  const docA = new LoroDoc();
  const docB = new LoroDoc();
  
  //...operations on docA and docB
  
  // Assume docA and docB are two Loro documents in two different devices
  const bytesA = docA.export({ mode: "update" });
  // send bytes to docB by any method
  docB.import(bytesA);
  // docB is now updated with all the changes from docA
  
  const bytesB = docB.export({ mode: "update" });
  // send bytes to docA by any method
  docA.import(bytesB);
  // docA and docB are now in sync, they have the same state
  
}

export function SaveState() {

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
}

export function DataStructures() {
  const doc = new LoroDoc();
  const list: LoroList = doc.getList("list");
  list.insert(0, "A");
  list.insert(1, "B");
  list.insert(2, "C");
  
  const map: LoroMap = doc.getMap("map");
  // map can only has string key
  map.set("key", "value");
  console.log(doc.toJSON());
  // expect(doc.toJSON()).toStrictEqual({
  //   list: ["A", "B", "C"],
  //   map: { key: "value" },
  // });
  
  // delete 2 element at index 0
  list.delete(0, 2);
  console.log(doc.toJSON());
  // expect(doc.toJSON()).toStrictEqual({
  //   list: ["C"],
  //   map: { key: "value" },
  // });
  
  // Insert a text container to the list
  const text = list.insertContainer(0, new LoroText());
  text.insert(0, "Hello");
  text.insert(0, "Hi! ");
  
  console.log(doc.toJSON());
  // expect(doc.toJSON()).toStrictEqual({
  //   list: ["Hi! Hello", "C"],
  //   map: { key: "value" },
  // });
  
  // Insert a list container to the map
  const list2 = map.setContainer("test", new LoroList());
  list2.insert(0, 1);
  console.log(doc.toJSON());
  // expect(doc.toJSON()).toStrictEqual({
  //   list: ["Hi! Hello", "C"],
  //   map: { key: "value", test: [1] },
  // });
}

export function IncrementalVersions() {
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
    console.log(newDoc.toJSON());
    // expect(newDoc.toJSON()).toStrictEqual({
    //   text: "Hello world!",
    // });
  
    // import update0
    newDoc.import(update0);
    console.log(newDoc.toJSON());
    // expect(newDoc.toJSON()).toStrictEqual({
    //   text: "✨Hello world!",
    // });
  
    // import update1
    newDoc.import(update1);
    console.log(newDoc.toJSON());
    // expect(newDoc.toJSON()).toStrictEqual({
    //   text: "😶‍🌫️✨Hello world!",
    // });
  }
  
  {
    /**
     * You may also import them in a batch
     */
    const newDoc = new LoroDoc();
    newDoc.importUpdateBatch([update1, update0, data]);
    console.log(newDoc.toJSON());
    // expect(newDoc.toJSON()).toStrictEqual({
    //   text: "😶‍🌫️✨Hello world!",
    // });
  }
}