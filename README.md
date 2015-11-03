This package is currently version 0.0.1, suitable for community testing and feedback. See the todos section below for development plans.

# QuillReactive

Helpers for QuillJS rich text (WYSIWYG) editor, with live editing similar to Google Docs or Etherpad.

See this example: http://quill-reactive-ot.meteor.com

To add it to your project:

`meteor add jonlachlan:quill-reactive`

To use the `QuillReactive` template, provide arguments for collectionName, docId and field.

```
 {{> QuillReactive collection="myCollection" docId=docId field="fieldName"}}
```

Note that `collection` should be the MongoDB collection name, not the global variable.

## About

Quill uses `ottypes rich-text` for performing operational transform (OT) on changes to rich text. It also has terrific modules such as toolbars, undo manager, authorship highlighting, and multiple cursors.

### Live Editing

This package combines the features of Quill with the data reactivity of Meteor. The result is a text editor that has the same live editing features as Google Docs and Etherpad.

Live edits are optional, though. If you want to make edits to

### Offline Edits and Late Updates

You can also make offline edits, which are seamlessly re-integrated when you get back online.

### Drafts

QuillReactive uses a persistent Session variable, so drafts are not lost if the user reloads the page.

## Todos

* Customizable settings helpers (e.g., toolbar buttons)
* Styling support for UI frameworks such as Bootstrap and Semantic UI
* Default options for authorship and multiple cursors
* Improve documentation for various usage possibilities
