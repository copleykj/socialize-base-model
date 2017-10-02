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

__save__ - Save instance to the database. If the instance was not previously saved to the database this will perform an insert. Otherwise it will diff the changes and update the database using a $set and update.

```javascript
var book = Meteor.books.findOne();

book.title = 'To Kill a Mockingbird';

book.save();
```

__update(modifier)__ - Update the record for the instance making changes specified by the modifier. In most cases it'll be easier to use `save` but this is here if needed.

```javascript
Meteor.books.findOne().update({
    $set: { title:'Meteor For Dummies' }
});
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
Meteor.books.findOne().getCollectionName(); //-> 'books'
```

__getUpdatableFields()__ - returns an object of values for all fields on the model that are allowed to be updated. This is particularly useful for passing to `vazco:uniforms`

## Static Methods ##

__attachCollection(Mongo.Collection)__ - Attach the collection to the model so that save/update/delete know which collection to modify. If you

__attachSchema(SchemaInstance)__ - Create a schema or add to the schema if one already exists. `SchemaInstance` is an instance of `SimpleSchema`.

```javascript
Author.attachSchema(new SimpleSchema({
    firstName: {
        type: String,
        max: 20
    },
    lastName: {
        type: String,
        max: 20
    },
}));
```

__createEmpty(id)__ - Returns an instance with only the id field set as the specified id {id:'8D7XmQb3KEpGqc3AD'}. Handy for when you already have the id of a record and want to do an update to the collection but don't want to do a full database call to get a populated instance.
