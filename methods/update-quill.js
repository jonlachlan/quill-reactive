Meteor.methods({
  'updateQuill': function(collectionName, docId, field, delta, index) {
    var collection = Mongo.Collection.get(collectionName);
    var doc = collection.findOne({_id: docId});
    var fieldDelta = field + "Delta";
    var fieldDeltaStack = field + "DeltaStack";
    var fieldDeltaIndex = field + "DeltaIndex";
    var update;
    var oldDelta = new Delta(doc[fieldDelta]);

    if(index < doc[fieldDeltaIndex]) {
      // More updates have taken place since method was called, so we need to
      // transform our delta to ensure we're not overwriting other work.
      console.log("handling out-of-turn delta");
      var newDelta = new Delta(delta);
      for(var i = index; i <= doc[fieldDeltaIndex]; i++) {
        var last = new Delta(doc[fieldDeltaStack][i])
        newDelta = last.transform(newDelta, 1);
      }
      update = oldDelta.compose(newDelta);
    } else {
      update = oldDelta.compose(delta);
    }

    var updateObj = {$set: {}};
    updateObj["$set"][fieldDelta] = update;
    if(typeof doc[fieldDeltaStack] === "undefined") {
      updateObj["$set"][fieldDeltaStack] = [ oldDelta.diff(update) ];
      updateObj["$set"][fieldDeltaIndex] = 0;
    } else {
      updateObj.$push = {};
      updateObj["$push"][fieldDeltaStack] = oldDelta.diff(update);
      updateObj["$set"][fieldDeltaIndex] = doc[fieldDeltaStack].length; // New index
    }
    collection.update({_id: docId}, updateObj)
  }
})
