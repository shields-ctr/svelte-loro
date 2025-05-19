import { LoroDoc } from 'loro-crdt';
// An attempt to wrap a LoroDoc in a Svelte store.

// This is the Svelte Store Contract;
// https://svelte.dev/docs/svelte/stores#Store-contract
type store = {
  subscribe: (subscription: (value: any) => void) => (() => void), 
  set?: (value: any) => void
}

// This adapter should mediate between Loro Document events and Svelte reactivity
export class LoroStore implements store {
  private doc: LoroDoc;
  private subscribers: ((value: any) => void)[] = [];
  
  constructor(doc: LoroDoc) {
    this.doc = doc;
  }

  subscribe(subscription: (value: any) => void) {
    this.subscribers.push(subscription);
    this.notify();
    return this.unsubscriber(subscription);
  }

  private notify() {
    this.subscribers.forEach( (subscriber) => {
      subscriber(this.doc.toJSON()) // TODO or a relevant subset of the document?
    });
  }

  unsubscriber(subscription: (value:any) => void) {
    const unsubscribe = () => {
      const index = this.subscribers.indexOf(subscription);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    }
    return unsubscribe;
  }

  // TODO this store must also be writable;
  set(value: any) {
    this.doc.import(value); // TODO again, we might want to drill down to a specific part of the document...
    this.notify();
  }

  // TODO how do we recursively handle parts of hte document as with Svelte Store Objects and Arrays?
}