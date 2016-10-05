# gulf-editor-contenteditable
[Gulf](http://github.com/gulf/gulf#readme) bindings for contenteditable elements

(This version is compatible with gulf v5 only. For a gulf v4 compatible package check out `gulf-contenteditable` on npm.)

## Install

```
npm install --save gulf gulf-editor-contenteditable dom-ot
```

## Usage

```
const domOT = require('dom-ot')
const ContenteditableDocument = require('gulf-editor-contenteditable')

var editable = document.querySelecor('#doc[contenteditable]')
var doc = new ContenteditableDocument({
  storageAdapter: new gulf.MemoryAdapter
, ottype: domOT
, editorInstance: editable
})
```

## API
### class ContenteditableDocument({editorInstance:HTMLElement,...}) extends gulf.EditableDocument
  * `contenteditable` -- a contenteditable Element to be wired up with gulf
  * `storageAdapter` -- a gulf storage adapter
  * `ottype` -- the OT type, with this binding you'll want `dom-ot`


## Legal
(c) 2015 by Marcel Klehr

GNU Lesser General Public License
