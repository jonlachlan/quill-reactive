if (Meteor.isServer) {
    Meteor.methods({
        'updateQuill': function(collectionName, docId, field, delta, editorContents) {
            console.log('updateQuill server side called with delta',delta );
            var collection = Mongo.Collection.get(collectionName);
            // var stack = QuillStacks.findOne({collection: collectionName, docId: docId, field: field});
            // if(typeof stack === "undefined") {
            //     console.log("inserting new stack")
            //     var doc = collection.findOne({_id: docId});
            //     var startDelta = new Delta(doc[field]);
            //     stack = QuillStacks.insert({
            //         collection: collectionName,
            //         docId: docId,
            //         field: field,
            //         stack: [
            //             {
            //                 delta: startDelta,
            //                 content: startDelta
            //             }
            //         ]
            //     });
            //     stack = QuillStacks.findOne({collection: collectionName, docId: docId, field: field});
            // }

            // var stackUpdate = {
            //         $set: {
            //             stack: [{
            //                 delta: delta,
            //                 content: editorContents
            //             }]
            //         }
            // };

            // QuillStacks.update({_id: stack._id}, stackUpdate);

            var collectionUpdate = { $set: {} };
            collectionUpdate["$set"][field + "Delta"] = editorContents;
            // if(typeof stack.currentIndex === "undefined") {
            //     collectionUpdate["$set"][field + "Index"] = 0;
            // } else {
            //     collectionUpdate["$inc"] = {};
            //     collectionUpdate["$inc"][field + "Index"];
            // }
            collection.update({_id: docId}, collectionUpdate)
            //console.log('stackUpdate',stackUpdate);
            console.log('collection update', collectionUpdate);
        } //end updateQuill
    }) //end Meteor.methods
};