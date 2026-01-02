/* eslint-disable import/no-unresolved */
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'meteor/aldeed:simple-schema';
import construct from './base-model';
/* eslint-enable import/no-unresolved */

const BaseModel = construct(Meteor, SimpleSchema);

export { BaseModel, SimpleSchema };
