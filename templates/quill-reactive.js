//define quill using require instead of import
//since we are using an npm dependency in the same file
const Quill = require('quill');

// if(typeof QuillDrafts === "undefined") {
//     // Persistent ReactiveDict makes drafts save over page reloads.
//     // However, two tabs in the same browser will be sharing the same data!
//     QuillDrafts = new PersistentReactiveDict('QuillDrafts');
// }

textChangesListener = function(delta, oldDelta, source) {
    console.log('text change listener called',source);
    if (source === 'user') {
        //var oldDelta = new Delta(_.extend({}, this.tmpl.quillEditor.oldDelta));
        //this.tmpl.quillEditor.oldDelta = this.tmpl.quillEditor.oldDelta.compose(delta);
        tmpl.quillEditor.oldDelta = tmpl.quillEditor.getContents();
        var opts = tmpl.data;
        var collection = Mongo.Collection.get(opts.collection);
        var doc = collection.findOne({_id: opts.docId});
        // Check for other new content besides the last keystroke
        var editorContents = tmpl.quillEditor.getContents();
        console.log('textChangesListener', editorContents);
        if(oldDelta.compose(delta).diff(editorContents).ops.length > 0) {
            updateDelta = oldDelta.diff(editorContents);
        } else {
            updateDelta = delta;
        }
        console.log(updateDelta);
        console.log('calling update Quill', opts.collection, opts.docId, opts.field, updateDelta, editorContents);
        Meteor.call("updateQuill", opts.collection, opts.docId, opts.field, updateDelta, editorContents);
    }
};

Template.quillReactive.onCreated(function() {
    var tmpl = this;
    tmpl.quillEditor = {};
});

Template.quillReactive.onRendered(function() {
    tmpl = this;
    // var authorId = Meteor.user().username;
    tmpl.quillEditor = new Quill('#editor-' + tmpl.data.docId, {
        modules: {
        'toolbar': '#toolbar'
        },
        theme: 'snow'
    });

    //debug
    window.qe = tmpl;

    // var previousDraft = QuillDrafts.get(tmpl.data.collection + "-" + tmpl.data.docId + "-" + tmpl.data.field);
    // if(previousDraft && previousDraft.draft && previousDraft.draft.ops.length > 0) {
    //   tmpl.quillEditor.oldDelta = new Delta(previousDraft.oldDelta);
    //   var draftDelta = tmpl.quillEditor.oldDelta.compose(previousDraft.draft);
    //   tmpl.quillEditor.setContents(draftDelta);
    // } else {
        tmpl.quillEditor.oldDelta = tmpl.quillEditor.getContents();
    // }

    // Fix link tooltip from getting stuck
    tmpl.$('.ql-container').mousedown(function(e) {
        if(!($(e.target).is('a'))) {
        $('.ql-tooltip.ql-link-tooltip:not(.editing)').css('left', '-10000px');
        }
    });
    //var authorship = tmpl.quillEditor.getModule('authorship');
    var fieldDelta = tmpl.data.field + "Delta";
    var collection = Mongo.Collection.get(tmpl.data.collection);

    var blankObj = {}
    blankObj[tmpl.data.field] = "";
    blankObj[tmpl.data.fieldDelta] = new Delta();


    Tracker.autorun(function() {
        //autorun to sync quill editor contents to the mongo Delta/content

        var doc = collection.findOne({_id:tmpl.data.docId});

        if(!doc) {
            return;
        }

        if(!doc[tmpl.data.field]) {
            collection.update({_id: tmpl.data.docId}, {$set: blankObj});
        }

        //get the contents as they sit in mongo
        var remoteContents = new Delta(doc[fieldDelta]);
        if(!remoteContents) {
            remoteContents = new Delta();
        }
        //our last known copy
        var oldContents = tmpl.quillEditor.oldDelta;
        //console.log('remoteChanges diff', oldContents,remoteContents);
        //console.log('diff is',oldContents.diff(remoteContents));
        //var remoteChanges = oldContents.diff(remoteContents);
        var editorContents = new Delta(tmpl.quillEditor.getContents());
        var remoteChanges = editorContents.diff(remoteContents);
        console.log('remoteChanges diff',remoteChanges);

        //var localChanges = oldContents.diff(editorContents);
        if(remoteChanges.ops.length > 0) {
            // Make updates, to allow cursor to stay put
            //tmpl.quillEditor.updateContents(localChanges.transform(remoteChanges, true));
            tmpl.quillEditor.updateContents(remoteChanges,'silent');
            tmpl.quillEditor.oldDelta = tmpl.quillEditor.getContents();
        }

        //tmpl.quillEditor.oldDelta = oldContents.compose(remoteChanges);


    });

    Tracker.autorun(function() {
        if(Session.get("liveEditing") && Meteor.status().connected) {
            console.log('setting up text changes listener');
            if (tmpl.quillEditor){
                tmpl.quillEditor.on('text-change', textChangesListener);
            }
            console.log('done setting up text changes listener');
        } else {
            console.log('removing text changes listener');
            if (tmpl.quillEditor){
                tmpl.quillEditor.off("text-change", textChangesListener);
            }
        }
    });
});

Template.quillReactive.helpers({
  liveEditing: function() {
    return Session.get("liveEditing");
  },
  connection: function() {
    status = Meteor.status().status;
    return {
      connected: function() { return (status === "connected")},
      connecting: function() { return (status === "connecting")},
      offline: function() { return (status === "offline" || status === "waiting")}
    }
  },
  hasEdits: function() {
    // var tmpl = Template.instance();
    // var unsavedChanges = QuillDrafts.get(tmpl.data.collection + "-" + tmpl.data.docId + "-" + tmpl.data.field);
    // if(tmpl.quillEditor && unsavedChanges) {
    //   var hasEdits = (unsavedChanges && unsavedChanges.draft && unsavedChanges.draft.ops.length > 0)
    //   return (hasEdits)
    // }
    return true;
  }
});


Template.quillReactive.events({
  'click .ql-save': function(e, tmpl) {
      console.log('save was clicked');
    if(!tmpl.data.field) {
        console.log('no data field, exiting save');
      return;
    }
    var collection = Mongo.Collection.get(tmpl.data.collection);
    var fieldDelta = tmpl.data.field + "Delta";
    var fieldPrevious = tmpl.data.field + "Diff";
    var newContents = tmpl.quillEditor.getContents();
    var newHTML = tmpl.quillEditor.root.innerHTML;
    updateObj = { $set: {}};
    updateObj.$set[fieldDelta] = newContents;
    updateObj.$set[tmpl.data.field] = newHTML;
    // updateObj.$push[tmpl.data.field + "DeltaUndoStack"] = {
    //   undo: newContents.diff(tmpl.quillEditor.oldDelta),
    //   redo: tmpl.quillEditor.oldDelta.diff(newContents)
    // }
    // This update assumes that we already have the latest contents in our editor
    collection.update({_id: tmpl.data.docId}, updateObj)
  },
  'click .ql-discard': function(e, tmpl) {
    if(!tmpl.data.field) {
      return;
    }
    alertify.confirm("Do you really want to discard your unsaved work? Text will be reverted to its last saved state.")
      .set('onok', function(closeEvent) {
        tmpl.quillEditor.setContents(editor.oldDelta);
      }
    );
  },
  'click .toggle-live-editing': function(e, tmpl) {
    Session.set("liveEditing", !Session.get("liveEditing"));
  },
  'click .ql-reconnect': function(e, tmpl) {
    Meteor.reconnect();
  }
});
