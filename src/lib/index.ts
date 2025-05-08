// place files you want to import through the `$lib` alias in this folder.
import * as Y from 'yjs'

export function yjsExample() {

  // Yjs documents are collections of
  // shared objects that sync automatically.
  const ydoc = new Y.Doc()
  // Define a shared Y.Map instance
  const ymap = ydoc.getMap()
  ymap.set('keyA', 'valueA')

  // Create another Yjs document (simulating a remote user)
  // and create some conflicting changes
  const ydocRemote = new Y.Doc()
  const ymapRemote = ydocRemote.getMap()
  ymapRemote.set('keyB', 'valueB')

  // Merge changes from remote
  const update = Y.encodeStateAsUpdate(ydocRemote)
  Y.applyUpdate(ydoc, update)

  // Observe that the changes have merged
  console.log(ymap.toJSON()) // => { keyA: 'valueA', keyB: 'valueB' }
}