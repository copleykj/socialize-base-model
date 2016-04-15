import { _ } from 'meteor/underscore';
import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import './security.js';

function extend(reciever, provider) {
    for(var prop in provider){
        if(provider.hasOwnProperty(prop)){
            reciever[prop] = provider[prop];
        }
    }
}

function diff(a,b) {
    var keys = _.map(a, function(v, k){
        if(b[k] === v){
            return k;
        }
    });
    return _.omit(a, keys);
}

export default class BaseModel {
    constructor(document){
        document = document || {};
        extend(this, document);
        this._document = document;
    }

    static createEmpty(_id) {
        return new this({_id:_id});
    }

    static attachCollection(collection, transform = true) {
        if(transform){
            collection._transform = (document) => {
                return new this(document);
            };
        }

        this.prototype.getCollection = function() {
            return collection;
        };

        Meteor[collection._name] = collection;
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

    _checkCollectionExists() {
        if(!this.getCollection()) {
            throw new Error("No collection found. Pleas use extendAndSetupCollection() to create your models");
        }
    }


    getCollectionName() {
        this._checkCollectionExists();
        return this.getCollection()._name;
    }

    checkOwnership() {
        return this.userId === Meteor.userId();
    }

    save(callback) {
        this._checkCollectionExists();
        var obj = {};
        var schema = this._getSchema();

        _.each(this, function(value, key) {
            if(key !== "_document"){
                obj[key] = value;
            }
        });


        if(this._id){
            //diff and update
            obj = diff(obj, this._document);
            this.getCollection().update(this._id, {$set:obj}, callback);
        }else{
            if(Meteor.isClient && schema){
                obj = schema.clean(obj);
            }
            this._id = this.getCollection().insert(obj, callback);
        }

        return this;
    }

    update(modifier) {
        if(this._id){
            this._checkCollectionExists();

            this.getCollection().update(this._id, modifier);
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

    remove() {
        if(this._id){
            this._checkCollectionExists();

            this.getCollection().remove({_id:this._id});
        }
    }

}

