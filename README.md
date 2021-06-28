# Base Model

This package provides an extensible, yet opinionated, base from which to build your models. It uses simpl-schema for data integrity, allow/deny for simple security, and collection-hooks for actions that need to be completed before or after CRUD operations complete. The [Socialize][socialize] package set is built upon this package.

>This is a [Meteor][meteor] package with part of it's code published as a companion NPM package made to work with clients other than Meteor. For example your server is Meteor, but you want to build a React Native app for the client. This allows you to share code between your Meteor server and other clients to give you a competitive advantage when bringing your mobile and web application to market.

<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->
- [Supporting The Project](#supporting-the-project)
- [Meteor Installation](#meteor-installation)
- [NPM Installation](#npm-installation)
- [Usage Outside Meteor](#usage-outside-meteor)
  - [React Native](#react-native)
- [Basic Usage](#basic-usage)
- [Caveats](#caveats)
<!-- /TOC -->

## Supporting The Project

Finding the time to maintain FOSS projects can be quite difficult. I am myself responsible for over 30 personal projects across 2 platforms, as well as Multiple others maintained by the [Meteor Community Packages](https://github.com/meteor-community-packages) organization. Therfore, if you appreciate my work, I ask that you either sponsor my work through GitHub, or donate via Paypal or Patreon. Every dollar helps give cause for spending my free time fielding issues, feature requests, pull requests and releasing updates. Info can be found in the "Sponsor this project" section of the [GitHub Repo](https://github.com/copleykj/socialize-base-model)

## Meteor Installation

```sh
meteor install socialize:base-model
meteor npm install --save simpl-schema
```

## NPM Installation

```sh
npm install --save @socialize/base-model react-native-meteor-collection2
```

## Usage Outside Meteor

The client side parts of this package are published to NPM as `@socialize/cloudinary` for use in front ends outside of Meteor.

When using the npm package you'll need to connect to a server, which hosts the server side Meteor code for your app, using `Meteor.connect` as per the [@socialize/react-native-meteor usage example](https://github.com/copleykj/react-native-meteor#example-usage) documentation.

 ```javascript
Meteor.connect('ws://192.168.X.X:3000/websocket');
 ```

### React Native

When using this package with React Native there is some minor setup required by the `@socialize/react-native-meteor` package. See [@socialize/react-native-meteor react-native](https://github.com/copleykj/react-native-meteor#react-native) for necessary instructions.

## Basic Usage

For save/update/delete you will need a collection attached to the Class which has a SimpleSchema attached to it. This is to ensure that you think about securing your models. Properly secured models can execute database operations completely client side without the need to manually define Meteor Methods. If you aren't familiar with Simple Schema, you can find the documentation [Here][simple-schema].

Lets get started with a quick example by Modeling a Book.

Depending on which platform you are on, you'll need to import things, and instantiate your Collections slightly different.

```javascript
// For meteor
import { BaseModel } from 'meteor/socialize:base-model';
import { Mongo } from 'meteor/mongo';
```

```javascript
// For React Native
import BaseModel from '@socialize/base-model';
import Collection from 'react-native-meteor-collection2';
```

```javascript

// Both Meteor and React Native
import SimpleSchema from 'simpl-schema';

//We assume that another model of an Author exists so we can import its collection here..
import { AuthorsCollection }  from "/models/Author";

//In Meteor Collection is scoped to Mongo
const BooksCollection = new Mongo.Collection("books");

//In React Native Collection is imported from react-native-meteor-collection2
const BooksCollection = new Collection("books");

const BooksSchema = new SimpleSchema({
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

class BookModel extends BaseModel {
    owner() {
        return Meteor.users.findOne(this.userId);
    }

    fullTitle() {
        return `${this.title}: ${this.subTitle}`;
    }

    author() {
        return AuthorsCollection.findOne(this.authorId);
    }
}

//Attach the schema to the collection
BooksCollection.attachSchema(BooksSchema);

//Attach the collection to the model so we can save/update/delete
BookModel.attachCollection(BooksCollection);

// This is Meteor server code and should not be added on React Native
BooksCollection.allow({
    insert(userId, book) {
        /*
        book is an instance of the Book class thanks to collection
        transforms. This enables us to call it's methods to check
        if the user owns it and the author record exists
        */
        return book.checkOwnership() && !!book.author();
    },
    update(userId, book) {
        /*
        book is an instance of the Book class thanks to collection
        transforms. This enables us to call it's methods to check
        if the user owns it and the author record exists
        */
        return book.checkOwnership() && !!book.author();
    },
    remove(userId, book) {
        /*
        book is an instance of the Book class thanks to collection
        transforms. This enables us to call it's methods to check
        if the user owns it and the author record exists
        */
        return book.checkOwnership()
    }
});
```

Let's examine what we have done here.

1. Import all the necessary parts. `Mongo`, `SimpleSchema`, and `BaseModel`.
2. Instantiate a `Mongo.Collection` and a `SimpleSchema` and define the schema for the model
3. Attach the schema to the collection as our first layer of write security.
4. Define a `Book` class that extends `BaseModel` making sure to call `super(document)`
5. Attach the collection to the `Book` class enabling instances of the class to execute save/update/remove operations
6. Specify allow rules for the collection as a final layer of security thus allowing total client side manipulation.

Now we are all set up to use the new `Book` class, and since we've properly secured our database writes through a combination of [SimpleSchema][simple-schema] and allow rules, we can now do all of our database operations using client side database methods.

>**Don't believe client side only database is possible?** Check the [results][allow-deny] of Discover Meteor's allow/deny security challenge and take note that it mentions issues with other submissions, but you'll only find *Kelly Copley* listed under people who got it right. Guess how I secured my solution ;-).

With this in mind, lets insert a book in to the database client side.

```javascript
//first we get get an Author for the book we want to insert
var author = Meteor.authors.findOne({firstName:"Dave", lastName:"Pilkey"});

var book = new Book({
    title: "Captain Underpants",
    subTitle: "and The Sensational Saga of Sir-Stinks-A-Lot",
    authorId: author._id,
    garbageKey: "Stripped By SimpleSchema.clean() when calling save()"
});

book.save(); //This will also clean the data before inserting so no garbage data gets through.
```

We do this with code (dev tools? :-P ), but you could use a form and template events, OR you could define necessary information on your `SimpleSchema` and use `aldeed:autoform` or `vazco:uniforms` to render a form to input this information.

Now that we have data in the database we can read it out, display it, and use the methods defined on the class as helpers. Assuming we have a template with a helper that returns a cursor from `Meteor.books`, we can iterate over the cursor and the context will be an instance of the `Book` class and we can call the methods of the class such as `fullTitle`, and `author`. Awesomely, since we've also returned a instance of the `Author` class from the `author` method, we can also call it's methods as well such as `author.fullName` which could concatenate the authors first and last name and return a single string.

```html
<h1>Book List</h1>
{{#each books}}
    <p>Author's Name: {{author.fullName}}<p>
    <p>{{fullTitle}}</p>
{{/each}}
```

This would yield HTML like so..

```html
<h1>Book List</h1>
<p>Author's Name: Dave Pilkey<p>
<p>Captain Underpants: and The Sensational Saga of Sir-Stinks-A-Lot </p>
```

## Caveats

There could be some things that I guess might not be so obvious. I'll try to list them here as they come up.

1. You must publish data for related models.. If `book.author()` returns a model of author that doesn't have data published for it, then it will return undefined. This is just how Meteor works.

For a more in depth explanation of how to use this package see [API.md](api)

[simple-schema]: https://github.com/aldeed/meteor-simple-schema
[allow-deny]: https://www.discovermeteor.com/blog/allow-deny-challenge-results/#results
[socialize]: https://atmospherejs.com/socialize
[meteor]: https://meteor.com
[api]: https://github.com/copleykj/socialize-base-model/blob/master/API.md
