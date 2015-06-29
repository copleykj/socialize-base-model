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

/*globals BaseModel:true*/

BaseModel = function(){};

BaseModel.createEmpty = function (_id) {
    return new this({_id:_id});
};

BaseModel.extend = function() {
    var child = function(document) {
        _.extend(this, document);
    };
    _.extend(child, this);
    child.prototype = Object.create(this.prototype);
    child.prototype.constructor = child;
    child.prototype._parent_ = this;
    child.prototype._super_ = this.prototype;

    return child;
};

BaseModel.extendAndSetupCollection = function(collectionName) {
    var model = this.extend();

    model.collection = model.prototype._collection = new Mongo.Collection(collectionName, {
        transform: function(document){
            return new model(document);
        }
    });

    Meteor[collectionName] = model.collection;

    return model;
};

BaseModel.appendSchema = function(schemaObject) {
    var schema = new SimpleSchema(schemaObject);
    var collection = this.prototype._collection;

    if(collection){
        collection.attachSchema(schema);
    }else{
        throw new Error("Can't append schema to non existent collection. Either use extendAndSetupCollection() or assign a collection to Model.prototype._collection");
    }
};

BaseModel.methods = function(methodMap) {
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

BaseModel.prototype.getSchema = function() {
    return this._collection._c2._simpleSchema;
};

BaseModel.prototype.checkCollectionExists = function() {
    if(!this._collection) {
        throw new Error("No collection found. Either use extendAndSetupCollection() or assign a collection to Model.prototype._collection");
    }
};

BaseModel.prototype.checkOwnership = function() {
    return this.userId === Meteor.userId();
};

BaseModel.prototype.save = function(callback) {
    this.checkCollectionExists();
    var obj = {};
    var schema = this.getSchema();

    _.each(this, function(value, key) {
        obj[key] = value;
    });

    if(Meteor.isClient && schema){
        obj = schema.clean(obj);
    }

    if(this._id){
        this._collection.update(this._id, {$set:obj}, callback);
    }else{
        this._id = this._collection.insert(obj, callback);
    }

    return this;
};

BaseModel.prototype.update = function(modifier) {
    if(this._id){
        this.checkCollectionExists();

        this._collection.update(this._id, modifier);
    }
};

BaseModel.prototype.remove = function() {
    if(this._id){
        this.checkCollectionExists();

        this._collection.remove({_id:this._id});
    }
};
