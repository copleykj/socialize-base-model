import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { diff } from 'mongodb-diff';
import './security.js';

function extend(reciever, provider) {
    for(var prop in provider){
        if(provider.hasOwnProperty(prop)){
            reciever[prop] = provider[prop];
        }
    }
}

export class BaseModel {
    constructor(document){
        document = document || {};
        extend(this, document);
        this._document = document;
    }

    static createEmpty(_id) {
        return new this({_id:_id});
    }

    static methods(methodMap) {
        var self = this;
        if(_.isObject(methodMap)){
            _.each(methodMap, function(method, name){
                if(_.isFunction(method)){
                    if(!self.prototype[name]){
                        self.prototype[name] = method;
                    }else{
                        throw new Meteor.Error("existent-method", "The method "+name+" already exists.");
                    }
                }
            });
        }
    };

    static updateTransformFunction() {
        this.prototype.getCollection()._transform = (document) => {
            return new this(document);
        };
    }

    static attachCollection(collection, transform = true) {
        this.prototype.getCollection = function() {
            return collection;
        };

        Meteor[collection._name] = collection;

        if(transform){
            this.updateTransformFunction();
        }

    }

    static appendSchema(schemaObject) {
        var schema = new SimpleSchema(schemaObject);
        var collection = this.prototype.getCollection();

        if(collection){
            collection.attachSchema(schema);
        }else{
            throw new Error("Can't append schema to non existent collection. Please use extendAndSetupCollection() to create your models");
        }
    }

    _getSchema() {
        var schema = Meteor._get(this.getCollection(), "_c2", "_simpleSchema");
        if(schema){
            return schema;
        }else{
            throw new Meteor.Error("noSchema", "You don't have a schema defined for " + this.getCollectionName());
        }

    }

    getCollection() {
        //We just throw here. This method is reassigned in attachCollection method when collection is attached.
        throw new Meteor.Error("noCollection", "You must use ClassName.attachCollection to attach a collection to your model.");
    }


    getCollectionName() {
        return this.getCollection()._name;
    }

    checkOwnership() {
        return this.userId === Meteor.userId();
    }

    save(callback) {
        const schema = this._getSchema();

        let obj = Object.keys(this).filter(
            (key) => key !== "_document").reduce(
                (accumulator, key) => {
                  accumulator[key] = this[key];
                  return accumulator;
                }, {}
            );

        if(this._id){
            this.update(diff(this._document, obj), callback);
        }else{
            if(Meteor.isClient && schema){
                obj = schema.clean(obj);
            }
            this._id = this.getCollection().insert(obj, callback);
        }

        return this;
    }

    update(modifier, callback) {
        if(this._id){
            this.getCollection().update(this._id, modifier, callback);
        }
    }

    _setProps(key, value, validationPathOnly) {
        var current;
        var level = this;
        var steps = key.split(".");
        var last = steps.pop();
        var set = {};
        var currentSet = set;

        while(current = steps.shift()){
            if(!validationPathOnly){
                if(level[current]){
                    if(!_.isObject(level[current])){
                        throw new Meteor.Error("PropertyNotObject", current + " of " + key + " is not an object");
                    }
                }else{
                    level[current] = {};
                }

                level = level[current];
            }
            currentSet = currentSet[current] = {};
        }

        if(!validationPathOnly) { level[last] = value; }

        currentSet[last] = value;

        return set;
    }


    _updateLocal(modifier) {
        this.getCollection()._collection.update(this._id, modifier);
    }

    set(key, value) {
        var context = this._getSchema().newContext();
        var obj = {};

        obj.$set = this._setProps(key, value, true);

        if(context.validate(obj, {modifier:true})){
            obj.$set = this._setProps(key, value);
            this[key] = value;

            if(Meteor.isClient){
                this._id && this._updateLocal(obj);
            }
        }else{
            throw new Meteor.Error(context.keyErrorMessage(key));
        }
        return this;
    }

    remove(callback) {
        if(this._id){
            this.getCollection().remove({_id:this._id}, callback);
        }
    }

}
