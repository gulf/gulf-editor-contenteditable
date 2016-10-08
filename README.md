# gulf-editor-contenteditable
[Gulf](http://github.com/gulf/gulf#readme) bindings for contenteditable elements

(This version is compatible with gulf v5 only. For a gulf v4 compatible package check out `gulf-contenteditable` on npm.)

## Install

```
npm install --save gulf-editor-contenteditable
```

## Usage

```
const ContenteditableDocument = require('gulf-editor-contenteditable')

var doc = new ContenteditableDocument({
  editorInstance: document.querySelecor('#doc[contenteditable]')
})
```

## API
### class ContenteditableDocument({editorInstance:HTMLElement,...}) extends gulf.EditableDocument
  * `editorInstance` -- a contenteditable Element to be wired up with gulf
  * `storageAdapter` -- (optional) a gulf storage adapter. Default is `gulf.MemoryAdapter`
  * `ottype` -- (optional) the OT type to use. With this binding the default is `dom-ot`


## Legal
(c) 2015 by Marcel Klehr

GNU Lesser General Public License
