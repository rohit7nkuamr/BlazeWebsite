// database.js
import firebase from './firebase-config.js';

export const database = firebase.database();

export const writeContactData = (data) => {
  return database.ref('contacts').push(data);
};
