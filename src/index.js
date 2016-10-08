/**
 * gulf-editor-contenteditable
 * Copyright (C) 2015-2016 Marcel Klehr <mklehr@gmx.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var gulf = require('gulf')
  , domOT = require('dom-ot')
  , MutationSummary = require('mutation-summary')

class ContenteditableDocument extends gulf.EditableDocument {
  constructor(opts) {
    opts.ottype = opts.ottype || domOT
    super(opts)
    if (!opts.editorInstance) throw new Error('No contenteditable HTMLElement passed')
    this.rootNode = opts.editorInstance
  
    this.mutationSummary = new MutationSummary({
      rootNode: this.rootNode, // (defaults to window.document)
      oldPreviousSibling: true,
      queries: [
        { all: true}
      ],
      callback: (summaries) => this.onLocalChange(summaries)
    })
  }

  close() {
    super.close()
    this.mutationSummary.disconnect()
  }
  
  _onLocalChange(summaries) {
    var ops = domOT.adapters.mutationSummary.import(summaries[0], this.rootNode)
    ops = ops.filter(function(op) {
      // filter out changes to the root node
      if(op.path) return !!op.path.length
      else return true
    })
    if(!ops.length) return
    
    this.submitChange(ops)
    ops.forEach(function(op) {
      op.apply(this.rootNode, /*index:*/true, /*dry:*/true)
    })
  }

  _setContent(newcontent) {
    this.mutationSummary.disconnect()
    
    this.rootNode.innerHTML = ''
    for(var i=0; i<newcontent.childNodes.length; i++) {
      this.rootNode.appendChild(newcontent.childNodes[i].cloneNode(/*deep:*/true))
    }

    domOT.adapters.mutationSummary.createIndex(contenteditable)
    this.mutationSummary.reconnect()

    return Promise.resolve()
  }

  _onChange(changes) {
    observer.disconnect()

    var ops = domOT.unpackOps(changes)
    retainSelection(this.rootNode, ops, () => {
      ops.forEach((op) => {
        op.apply(this.rootNode, /*index:*/true)
      })
    })

    observer.reconnect()

    return Promise.resolve()
  }

  _onBeforeChange() {
    return Promise.resolve()
  }
}

module.export = ContenteditableDocument

function retainSelection(rootNode, ops, fn) {
  var selection = rootNode.ownerDocument.defaultView.getSelection()
        , ranges = []
  for(var i=0; i<selection.rangeCount; i++) {
    var range = selection.getRangeAt(i)
    ranges.push(domOT.transformCursor(range, ops, rootNode))
  }
  fn()
  selection.removeAllRanges()
  ranges.forEach(function(r) {
    var range = new Range
    if(r.startContainer) range.setStart(r.startContainer, r.startOffset)
    if(r.endContainer) range.setEnd(r.endContainer, r.endOffset)
    selection.addRange(range)
  })
}
