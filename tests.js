/* eslint-disable import/no-unresolved */
import { Tinytest } from 'meteor/tinytest';
import { BaseModel, SimpleSchema } from 'meteor/socialize:base-model';
import { Mongo } from 'meteor/mongo';

const collection = new Mongo.Collection('tests');
const schema = new SimpleSchema({
    test: {
        type: String,
    },
});

Tinytest.add('BaseModel.createEmpty', (test) => {
    const id = 'abcdefg';
    const emptyModel = BaseModel.createEmpty(id);

    test.instanceOf(emptyModel, BaseModel);
    test.equal(id, emptyModel._id);
});

Tinytest.add('BaseModel Collection Tests', (test) => {
    const model = new BaseModel();

    // getCollection should throw an error if the Class does not have a collection attached
    test.throws(() => {
        model.getCollection();
    }, 'noCollection');

    BaseModel.attachCollection(collection);

    // We should be abel to retrieve the colleciton we defined after we attach it.
    test.equal(collection, model.getCollection());

    // The name of the collection we get back should match the name we passed in
    test.equal(collection._name, model.getCollectionName());

    // Should throw an error because we have not attached a schema
    test.throws(() => {
        model._getSchema();
    }, 'noSchema');

    BaseModel.appendSchema(schema);

    // Should now get an instace of SimpleSchema from _getSchema
    test.instanceOf(model._getSchema(), SimpleSchema);
});
