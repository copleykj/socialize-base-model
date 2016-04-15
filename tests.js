import { Tinytest } from 'meteor/tinytest';
import BaseModel from 'meteor/socialize:base-model';

Tinytest.add("BaseModel.createEmpty", (test) => {
    let id = "abcdefg";
    let emptyModel = BaseModel.createEmpty(id);

    test.instanceOf(emptyModel, BaseModel);
    test.equal(id, emptyModel._id);
});
