"use strict";

exports.hello = (event, context, callback) => {
  callback(null, `${event} ${context} Hello world!`);
};