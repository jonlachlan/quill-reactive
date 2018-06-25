if (Meteor.isClient) {
    // Meteor.methods({
    // 'updateQuill': function(collectionName, docId, field, delta, newContents) {
    //     console.log('updateQuill client called',newContents)
    //     this.unblock();
    //     var collection = Mongo.Collection.get(collectionName);
    //     var updateObj = {$set: {}};
    //     updateObj["$set"][field + "Delta"] = newContents;
    //     console.log(updateObj);
    //     collection.update({_id: docId}, updateObj)
    // }
    // })
};