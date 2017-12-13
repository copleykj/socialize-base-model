/* eslint-disable import/no-unresolved */
import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { diff } from 'mongodb-diff';
/* eslint-enable import/no-unresolved */

import './security.js';

function extend(reciever, provider) {
    const rec = reciever;
    for (const prop in provider) {
        if (prop in provider) {
            rec[prop] = provider[prop];
        }
    }
}

export class BaseModel {
    constructor(document = {}, preClean) {
        let doc = document;
        if (preClean) {
            doc = this._getSchema().clean(doc);
        }
        extend(this, doc);
        this.getDocument = function getDocument() {
            return doc;
        };
    }

    static createEmpty(_id) {
        return new this({ _id });
    }

    static methods(methodMap) {
        const self = this;
        if (_.isObject(methodMap)) {
            _.each(methodMap, function eachMapMethod(method, name) {
                if (_.isFunction(method)) {
                    if (!self.prototype[name]) {
                        self.prototype[name] = method;
                    } else {
                        throw new Meteor.Error('existent-method', `The method ${name} already exists.`);
                    }
                }
            });
        }
    }

    static updateTransformFunction() {
        this.prototype.getCollection()._transform = document => new this(document);
    }

    static attachCollection(collection, transform = true) {
        this.prototype.getCollection = function getCollection() {
            return collection;
        };

        if (transform) {
            this.updateTransformFunction();
        }
    }

    static attachSchema(schemaInstance) {
        const collection = this.prototype.getCollection();

        if (collection) {
            collection.attachSchema(schemaInstance);
        } else {
            throw new Meteor.Error("Can't append schema to non existent collection. Please attach a collection to your model using `ModelName.attachCollection`");
        }
    }

    static appendSchema(schemaObject) {
        this.attachSchema(new SimpleSchema(schemaObject));
    }

    _getSchema() {
        const schema = Meteor._get(this.getCollection(), '_c2', '_simpleSchema');
        if (schema) {
            return schema;
        }
        throw new Meteor.Error('noSchema', `You don't have a schema defined for ${this.getCollectionName()}`);
    }

    getCollection() {
        // We just throw here. This method is reassigned in attachCollection method when collection is attached.
        if (this) throw new Meteor.Error('noCollection', 'You must use ClassName.attachCollection to attach a collection to your model.');
    }


    getCollectionName() {
        return this.getCollection()._name;
    }

    // get all values from the model that do not have a denyUpdate or denyUntrusted in their schema
    getUpdatableFields() {
        const schema = this._getSchema()._schema;
        const fields = { _id: this._id };

        for (const key of Object.keys(this)) {
            if (schema[key] && !(schema[key].custom && schema[key].custom === SimpleSchema.denyUntrusted) && !schema[key].denyUpdate) {
                fields[key] = this[key];
            }
        }

        return fields;
    }

    checkOwnership() {
        return this.userId === Meteor.userId();
    }

    save(callback) {
        const schema = this._getSchema();

        let obj = Object.keys(this).reduce(
            (accumulator, key) => {
                accumulator[key] = this[key]; // eslint-disable-line no-param-reassign
                return accumulator;
            }, {},
        );

        if (this._id) {
            const updateDiff = diff(this.getDocument(), obj);
            if (!_.isEmpty(updateDiff)) {
                this.update(updateDiff, callback);
            } else {
                callback && callback(null);
            }
        } else {
            if (Meteor.isClient && schema) {
                obj = schema.clean(obj, {
                    extendAutoValueContext: {
                        isInsert: true,
                        userId: Meteor.userId(),
                    },
                });
            }
            this._id = this.getCollection().insert(obj, callback);
        }

        return this;
    }

    update(modifier, callback) {
        if (this._id) {
            this.getCollection().update(this._id, modifier, callback);
        }
    }

    remove(callback) {
        if (this._id) {
            this.getCollection().remove({ _id: this._id }, callback);
        }
    }
}
