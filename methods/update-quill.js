Meteor.methods({
  'updateQuill': function(collectionName, docId, field, delta, index) {
    var collection = Mongo.Collection.get(collectionName);
    var stack = QuillStacks.findOne({collection: collectionName, docId: docId, field: field});
    if(typeof stack === "undefined") {
      console.log("inserting new stack")
      var doc = collection.findOne({_id: docId});
      var startDelta = new Delta(doc[field]);
      stack = QuillStacks.insert({
        collection: collectionName,
        docId: docId,
        field: field,
        stack: [
          {
            delta: startDelta,
            content: startDelta
          }
        ]
      });
      stack = QuillStacks.findOne({collection: collectionName, docId: docId, field: field});
    }
    var oldContent = new Delta( stack.stack[stack.stack.length - 1].content );

    if(index < stack.currentIndex) {
      // More updates have taken place since method was called, so we need to
      // transform our delta to ensure we're not overwriting other work.
      console.log("handling out-of-turn delta");
      var newDelta = new Delta(delta);
      for(var i = index; i <= stack.currentIndex; i++) {
        var last = new Delta(stack.stack[i].delta)
        newDelta = last.transform(newDelta, 1);
      }
      content = oldContent.compose(newDelta);
    } else {
      content = oldContent.compose(delta);
    }

    if(stack.stack && stack.stack.length) {
      var stackUpdate = {
        $push: {
          stack: {
            delta: delta,
            content: content
          }
        }
      };
    } else {
      var stackUpdate = {
        $set: [{
          stack: {
            delta: delta,
            content: content
          }
        }]
      };
    }

    QuillStacks.update({_id: stack._id}, stackUpdate);

    var collectionUpdate = { $set: {} };
    collectionUpdate["$set"][field + "Delta"] = content;
    if(typeof stack.currentIndex === "undefined") {
      collectionUpdate["$set"][field + "Index"] = 0;
    } else {
      collectionUpdate["$inc"] = {};
      collectionUpdate["$inc"][field + "Index"];
    }
    collection.update({_id: docId}, collectionUpdate)
  }
})
