# Base Model #

Provides an extensible base from which other extensible models can be built.

## How it works ##

BaseModel is the foundation on which the Socialize package set is built. It provides an easy way to set up your models with helpers and other convenience functions. Once you have created your models its as simple running `find` and `findOne` queries on your collections to get instances of the model. Once you have an instance you can then use the helpers to display data or the helper methods to modify and update the data for the model.

## Usage ##

Assuming we need to model books, we create the model like so. 

```javascript
Book = BaseModel.extendAndSetupCollection("books");
```

This creates a Class named `Book`, collection named `books`, assigns a reference for the collection to `Meteor.books` and tells the collection to return instances of the model instead of regular documents.

Now for security we need to set up the schema for the collection. BaseModel provides a convenient static method for adding a [SimpleSchema][1] to the collection, which is inherited by our classes when we extend BaseModel.

```javascript
Book.appendSchema({
	"userId":{
		type: String,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function() {
			if(this.isInsert){
				return this.userId;
			}
		}
	},
	"title":{
		type: String
		max: 30,
	},
	"subTitle":{
		type: String,
		max: 100
	},
	"authorId":{
		type: String,
		regEx: SimpleSchema.RegEx.Id
	}
});
```

And to finalize the write security we will use some light checking in allow or deny

```javascript
Meteor.books.allow({
	insert: function(userId, book){
		//book is an instance of Book class thanks to collection transforms.
		return book.checkOwnership() && !!Meteor.authors.findOne(this.authorId);
	},
	update: function(userId, book){
		//book is an instance of Book class thanks to collection transforms.
		return book.checkOwnership();
	},
	remove: function(userId, book) {
		//book is an instance of Book class thanks to collection transforms.
		return book.checkOwnership()
	}
});
```
 
Now that we have a `Book` class with a [SimpleSchema][1] attached to it's collection and allow rules in place, we can give it some helper methods that let us access it's data and reference related models.

```javascript
Book.methods({
	"owner": function(){
		return Meteor.users.findOne(this.userId);
	},
	"author": function() {
		//return an instance of Author that itself has methods
		return Meteor.authors.findOne(this.authorId);
	},
	"fullTitle": function() {
		return this.title + ": " + this.subTitle;
	}
});
```
Now we are all set up to use the new `Book` class, and since we've properly secured our database writes through a cobination of [SimpleSchema][1] and allow rules, we can now do all of our database operations using client side database methods.

Lets Insert a book

```javascript
var author = Meteor.authors.findOne({firstName:"Dave", lastName:"Pilkey"});

var book = new Book({
	title: "Captain Underpants",
	subTitle: "and The Sensational Saga of Sir-Stinks-A-Lot",
	authorId: author._id
});

book.save();
```

Now, assuming we have a template with a helper that returns a cursor from `Meteor.books`, we can now use the methods of the `Book` class as template helpers as well.

```html
	<h1>Book List</h1>
	{{#each books}}
		<p>{{author.fullName}}<p>
		<p>{{fullTitle}}</p>
	{{/each}}
```
---

## BaseModel (class) ##

### Instance Methods ###

Instance methods are helper functions available on the instances returned from `find` and `findOne` queries. BaseModel provides some that are inherited in the extend process.

**checkOwnership** - Check to make sure the userId property is equal to the _id of the currently logged in user.

```javascript
var myBook = Meteor.books.findOne();
if(myBook.checkOwnership()){
	mybook.remove();
}
```

**set** - update a property of the underlying data. This also updates the underlying minimongo collection if a record exists, and will reflect the change on the page if displayed there. This however does not save the data to the server side database. To save to server call the `save` method on the instance. 

_**If using this in a reactive context such as the data context of a template and modifying in an event attached to that template, you will need to save a copy to the template and modify that as modifying the underlying minimongo will cause a recomputation and wipe out any changes to the instance that was the data context**_

```javascript
var book = Meteor.books.findOne();

book.set("title", "Diary of a Wimpy Kid");
```

**save** - Save instance to the database. If the instance was not previously saved to the database this will perform an insert. Otherwise it will diff the changes and update the database using a $set and update.

```javascript
var book = Meteor.books.findOne();

book.set("title", "To Kill a Mockingbird");

book.save();
```

**update(modifier)** - Update the record for the instance making changes specified by the modifier. In most cases it'll be easier to use `save` but this is here if needed.

```javascript
Meteor.books.findOne().update({$set:{title:"Meteor For Dummies"}});
```

**remove** - Delete the database record for the instance.

```javascript
Meteor.books.findOne().remove();
```

## Static Methods ##

**extendAndSetupCollection("collectionName")** - Extend BaseModel and then set up the collection for the model and assign it to `Meteor[collectionName]` for ease of access outside of file and package scope.

```javascript
Author = BaseModel.extendAndSetupCollection("authors");
```

**appendSchema(SchemaObject)** - Create attach a schema or add to the schema if one already exists. `SchemaObject` is the same as you would pass to `new SimpleSchema(SchemaObject)`.

```javascript
Author.attachSchema({
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

**methods(methodObject)** - add methods to the class. `methodsObject` is a hash of functions.

```javascript
Author.methods({
	fullName: function() {
		return this.firstName +" "+ this.lastName;
	}
});
```

**createEmpty(id)** - Returns an instance with only the _id field set as the specified id *{_id:"8D7XmQb3KEpGqc3AD"}*. Handy for when you already have the _id of a record and want to do an update to the collection but don't want to do a full database call to get a populated instance.

[1]: https://github.com/aldeed/meteor-simple-schema