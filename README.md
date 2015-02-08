#Base Model#

Provides an extensible base for which to other extensible models can be built.

##Static Methods##

**BaseModel.extend()** - Create and return a new Class which extends Basemodel and has all of it's properties and methods including this one.

**BaseModel.createEmpty(id)** - Returns an instance with only the _id field set as the specified id *{_id:"8D7XmQb3KEpGqc3AD"}*. Handy for when you already have the _id of a record and want to do an update to the collection but don't want to do a full database call to get a populated instance.

##Prototypal Methods##

**BaseModel.prototype.checkCollectionExists()** - Used by BaseModel to check if you have set the _collection property so it knows which collection to perform operations on.

**BaseModel.prototype.checkOwnership()** - Check to make sure the userId property is equal to the _id of the currently logged in user.

**BaseModel.prototype.save()** - Save instance to the database.

**BaseModel.prototype.update(modifier)** - Update the record for the instance making changes specified by the modifier.

**BaseModel.prototype.remove()** - Delete the database record for the instance

##Examples##

```javascript
var Dog = BaseModel.extend();

Dog._collection = DogsCollection = new Mongo.collection("dogs", {
	transform:function (document) {
    	return new Dog(document);
    }
});

Dog.prototype.wag = function() {
	console.log(this.name + " wags tail");
}

var rufus = new Dog({breed:"Beagle", name:"Rufus"}).save();

rufus.wag(); //-> "Rufus wags tail"

var dogInstance = DogsCollection.findOne() //Instance of Dog

```

