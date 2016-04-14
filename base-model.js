//Object.create shim
if (typeof Object.create != 'function') {
    Object.create = (function() {
        var thing = function() {};
        return function (prototype) {
            if (arguments.length > 1) {
                throw Error('Second argument not supported');
            }
            if (typeof prototype != 'object') {
                throw TypeError('Argument must be an object');
            }
            thing.prototype = prototype;
            var result = new thing();
            thing.prototype = null;
            return result;
        };
    })();
}

var diff = function(a,b) {
    var keys = _.map(a, function(v, k){
        if(b[k] === v){
            return k;
        }
    });
    return _.omit(a, keys);
};

var extend = function(reciever, provider) {
    for(prop in provider){
        if(provider.hasOwnProperty(prop)){
            reciever[prop] = provider[prop];
        }
    }
}

/*globals BaseModel:true*/

BaseModel = function(){};

BaseModel.extend = function() {
    var Model = function(document) {
        extend(this, document);
        this._document = document;
    };

    Model.createEmpty = function (_id) {
        return new this({_id:_id});
    };

    Model.appendSchema = function(schemaObject) {
        var schema = new SimpleSchema(schemaObject);
        var collection = this.prototype.getCollection();

        if(collection){
            collection.attachSchema(schema);
        }else{
            throw new Error("Can't append schema to non existent collection. Please use extendAndSetupCollection() to create your models");
        }
    };

    Model.methods = function(methodMap) {
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

    Model.prototype._getSchema = function() {
        var schema = Meteor._get(this.getCollection(), "_c2", "_simpleSchema");
        if(schema){
            return schema;
        }else{
            throw new Meteor.Error("noSchema", "You don't have a schema defined for " + this.getCollectionName());
        }

    };

    Model.prototype._checkCollectionExists = function() {
        if(!this.getCollection()) {
            throw new Error("No collection found. Pleas use extendAndSetupCollection() to create your models");
        }
    };

    Model.prototype.getCollectionName = function() {
        this._checkCollectionExists()
        return this.getCollection()._name;
    };

    Model.prototype.checkOwnership = function() {
        return this.userId === Meteor.userId();
    };

    Model.prototype.save = function(callback) {
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
            this.update({$set:obj}, callback);
        }else{
            if(Meteor.isClient && schema){
                obj = schema.clean(obj);
            }
            this._id = this.getCollection().insert(obj, callback);
        }

        return this;
    };

    Model.prototype.update = function(modifier, callback) {
        if(this._id){
            this._checkCollectionExists();

            return this.getCollection().update(this._id, modifier, callback);
        }
    };

    Model.prototype._setProps = function(key, value, validationPathOnly) {
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
    };


    Model.prototype._updateLocal = function(modifier) {
        this.getCollection()._collection.update(this._id, modifier);
    };

    Model.prototype.set = function(key, value) {
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
    };

    Model.prototype.remove = function() {
        if(this._id){
            this._checkCollectionExists();

            this.getCollection().remove({_id:this._id});
        }
    };

    return Model;
};

BaseModel.extendAndSetupCollection = function(collectionName, noTransform) {
    var options = {};
    var model = this.extend();

    if(!noTransform){
        options.transform = function(document){
            return new model(document);
        };
    }

    var collection = model.collection = new Mongo.Collection(collectionName, options);

    model.prototype.getCollection = function() {
        return collection;
    };

    Meteor[collectionName] = model.collection;

    return model;
};
