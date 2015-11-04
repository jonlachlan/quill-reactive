Meteor.methods({
  'updateQuill': function(collectionName, docId, field, delta, newContents) {
    this.unblock();
    var collection = Mongo.Collection.get(collectionName);
    var updateObj = {$set: {}};
    updateObj["$set"][field + "Delta"] = newContents;
    collection.update({_id: docId}, updateObj)
  }
})
