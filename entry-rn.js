/* eslint-disable import/no-unresolved */
import Meteor from '@socialize/react-native-meteor';
import '@socialize/react-native-meteor-collection2';
import construct from './base-model.js';
/* eslint-enable import/no-unresolved */

const BaseModel = construct(Meteor);

export { BaseModel };
