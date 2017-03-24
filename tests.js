import { Tinytest } from 'meteor/tinytest';
import BaseModel from 'meteor/socialize:base-model';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

let collection = new Mongo.Collection('tests');
let schema = new SimpleSchema({
    test:{
        type: String
    }
});

Tinytest.add('BaseModel.createEmpty', (test) => {
    let id = 'abcdefg';
    let emptyModel = BaseModel.createEmpty(id);

    test.instanceOf(emptyModel, BaseModel);
    test.equal(id, emptyModel._id);
});

Tinytest.add('BaseModel Collection Tests', (test) => {

    let model = new BaseModel();

    //getCollection should throw an error if the Class does not have a collection attached
    test.throws(() => {
        model.getCollection();
    }, "noCollection");

    BaseModel.attachCollection(collection);

    //We should be abel to retrieve the colleciton we defined after we attach it.
    test.equal(collection, model.getCollection());

    //The name of the collection we get back should match the name we passed in
    test.equal(collection._name, model.getCollectionName());

    //Should throw an error because we have not attached a schema
    test.throws(() => {
        model._getSchema();
    }, 'noSchema');

    BaseModel.appendSchema(schema);

    //Should now get an instace of SimpleSchema from _getSchema
    test.instanceOf(model._getSchema(), SimpleSchema);

});
