## BaseModel (class) ##

### Instance Methods ###

Instance methods are helper functions available on the instances returned from `find` and `findOne` queries. BaseModel provides some that are inherited in the extend process.

__checkOwnership__ - Check to make sure the userId property is equal to the \_id of the currently logged in user.

```javascript
var myBook = Meteor.books.findOne();
if(myBook.checkOwnership()){
    mybook.remove();
}
```

__set__ - update a property of the underlying data. This also updates the underlying minimongo collection if a record exists, and will reflect the change on the page if displayed there. This however does not save the data to the server side database. To save to server call the `save` method on the instance.

>Note: __*If using this in a reactive context such as the data context of a template and modifying in an event attached to that template, you will need to save a copy to the template and modify that as modifying the underlying minimongo will cause a recomputation and wipe out any changes to the instance that was the data context*__

```javascript
var book = Meteor.books.findOne();

book.set("title", "Diary of a Wimpy Kid");
```

__save__ - Save instance to the database. If the instance was not previously saved to the database this will perform an insert. Otherwise it will diff the changes and update the database using a $set and update.

```javascript
var book = Meteor.books.findOne();

book.set("title", "To Kill a Mockingbird");

book.save();
```

__update(modifier)__ - Update the record for the instance making changes specified by the modifier. In most cases it'll be easier to use `save` but this is here if needed.

```javascript
Meteor.books.findOne().update({$set:{title:"Meteor For Dummies"}});
```

__remove__ - Delete the database record for the instance.

```javascript
Meteor.books.findOne().remove();
```

__getCollection__ - returns a reference to the underlying collection for the class.

```javascript
Meteor.books.findOne().getCollection();
```


__getCollectionName__ - returns a string specifying the name given to the collection when it was instantiated.

```javascript
Meteor.books.findOne().getCollectionName(); -> "books"
```

## Static Methods ##

__attachCollection(Mongo.Collection)__ - Attach the collection to the model so that save/update/delete know which collection to modify. If you

__appendSchema(SchemaObject)__ - Create a schema or add to the schema if one already exists. `SchemaObject` is the same as you would pass to `new SimpleSchema(SchemaObject)`.

```javascript
Author.appendSchema({
    "firstName":{
        type: String,
        max: 20
    },
    "lastName": {
        type: String,
        max: 20
    }
});
```


__createEmpty(id)__ - Returns an instance with only the id field set as the specified id {id:"8D7XmQb3KEpGqc3AD"}. Handy for when you already have the id of a record and want to do an update to the collection but don't want to do a full database call to get a populated instance.
