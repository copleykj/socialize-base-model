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
    var child = function (document) {
        _.extend(this, document);
    };
    _.extend(child, this);
    child.prototype = Object.create(this.prototype);
    child.prototype.constructor = child;
    child.prototype._parent_ = this;
    child.prototype._super_ = this.prototype;

    return child;
};

BaseModel.prototype.checkCollectionExists = function(){
    if(!this._collection) {
        throw new Error("Please supply a collection for your model");
    }
};

BaseModel.prototype.checkOwnership = function(){
    return this.userId === Meteor.userId();
};

BaseModel.prototype.save = function() {
    this.checkCollectionExists();

    if(this._id){
        this._collection.upsert(this._id, this);
    }else{
        this._id = this._collection.insert(this);
    }

    return this;
};

BaseModel.prototype.update = function(modifier) {
    if(this._id){
        this.checkCollectionExists();

        this._collection.update(this._id, modifier);
    }
};

BaseModel.prototype.remove = function(){
    if(this._id){
        this.checkCollectionExists();

        this._collection.remove({_id:this._id});
    }
};
