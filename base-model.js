/* eslint-disable import/no-unresolved */
import SimpleSchema from 'simpl-schema';
import MessageBox from 'message-box';
import { diff } from 'mongodb-diff';
/* eslint-enable import/no-unresolved */

export default (Meteor) => {
    /* We check for server code here to deal with a buffer issue in meteor-message-box
     * This shouldn't be a major issue as I doubt we will need to display this error
     * on the client at this point. Should be fixed though.
     * https://github.com/aldeed/meteor-message-box/issues/1
    */
    if (Meteor.isServer) {
        MessageBox.defaults({
            messages: {
                en: {
                    Untrusted: 'Inserts/Updates from untrusted code not supported',
                },
            },
        });
    }

    SimpleSchema.denyUntrusted = function denyUntrusted() {
        if (this.isSet) {
            const autoValue = this.definition.autoValue && this.definition.autoValue.call(this);
            const defaultValue = this.definition.defaultValue;

            if (this.value !== defaultValue && this.value !== autoValue && !this.isFromTrustedCode) {
                return 'Untrusted';
            }
        }
        return undefined;
    };

    function extend(reciever, provider) {
        const rec = reciever;
        for (const prop in provider) {
            if (prop in provider) {
                rec[prop] = provider[prop];
            }
        }
    }

    return class BaseModel {
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
            if ((typeof methodMap === 'function' || typeof methodMap === 'object') && !!methodMap) {
                const keys = Object.keys(methodMap);
                for (let i = 0, length = keys.length; i < length; i++) {
                    const method = methodMap[keys[i]];

                    if (typeof method === 'function') {
                        if (!self.prototype[keys[i]]) {
                            self.prototype[keys[i]] = method;
                        } else {
                            throw new Meteor.Error('existent-method', `The method ${keys[i]} already exists.`);
                        }
                    }
                }
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
                    if (key !== 'getDocument') accumulator[key] = this[key]; // eslint-disable-line no-param-reassign
                    return accumulator;
                }, {},
            );

            if (this._id) {
                const updateDiff = diff(this.getDocument(), obj);
                if (updateDiff && Object.keys(updateDiff).length !== 0) {
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
    };
};
