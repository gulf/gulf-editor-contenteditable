/**
 * gulf-contenteditable
 * Copyright (C) 2015 Marcel Klehr <mklehr@gmx.net>
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
 
module.exports = function(contenteditable) {
  var doc = new gulf.EditableDocument(new gulf.MemoryAdapter, domOT)
  doc.rootNode = contenteditable

  doc._setContents = function(newcontent, cb) {
    observer.disconnect()
    contenteditable.innerHTML = ''
    for(var i=0; i<newcontent.childNodes.length; i++) {
      contenteditable.appendChild(newcontent.childNodes[i].cloneNode(/*deep:*/true))
    }
    domOT.adapters.mutationSummary.createIndex(contenteditable)
    observer.reconnect()
    cb()
  }

  doc._change = function(changes, cb) {
    observer.disconnect()
    console.log('_change', changes)

    var ops = domOT.unpackOps(changes)
    retainSelection(doc.rootNode, ops, function() {
      ops.forEach(function(op) {
        op.apply(contenteditable, /*index:*/true)
      })
    })

    observer.reconnect()
    cb()
  }

  doc._collectChanges = function(cb) {
    // changes are automatically collected by MutationSummary
    cb()
  }
  
  var observer = new MutationSummary({
    rootNode: contenteditable, // (defaults to window.document)
    oldPreviousSibling: true,
    queries: [
      { all: true}
    ],
    callback: onChange
  })
  doc.mutationSummary = observer

  function onChange(summaries) {
    var ops = domOT.adapters.mutationSummary.import(summaries[0], contenteditable)
    ops = ops.filter(function(op) {
      // filter out changes to the root node
      if(op.path) return !!op.path.length
      else return true
    })
    if(!ops.length) return
    console.log(ops)
    doc.update(ops)
    ops.forEach(function(op) {
      op.apply(contenteditable, /*index:*/true, /*dry:*/true)
    })
  }
  
  return doc
}

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