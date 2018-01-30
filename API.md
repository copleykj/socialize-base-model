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

__attachCollection(Mongo.Collection)__ - Attach the collection to the model so that save/update/delete know which collection to modify.

```javascript
Author.attachCollection(AuthorsCollection);
```

__attachSchema(SchemaInstance)__ - Attach a schema to the currently attached collection or add to the schema if one already exists. `SchemaInstance` is an instance of `SimpleSchema`.

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

__methods(methodMap)__ - Takes an object of functions and attaches each function to the prototype for the class. This is useful in rare cases where you might not want to extend the class directly.

```javascript
Author.methods({
    fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    books() {
        return BooksCollection.find({ authorId: this._id });
    }
})
```

__updateTransformFunction__ - Cause the collection transform of the currently attached collection to return instances of the current class. When extending another model that already has a collection attached, you will need to call this to cause `find` and `findOne` to return instances of the new model.

```javascript
class MyAwesomeBook extends Book {

}
MyAwesomeBook.updateTransformFunction();
```

__createEmpty(id)__ - Avoids a database lookup by creating an instance with only the id field set as the specified id `{id:'8D7XmQb3KEpGqc3AD'}`. All methods are available on the instance and so it is handy for when you already have the id of a record and want to use a method that only requires the `_id` to do it's work

```javascript
Author.createEmpty("9zrP3yqna5GLH5mH6");

Author.books();
```
