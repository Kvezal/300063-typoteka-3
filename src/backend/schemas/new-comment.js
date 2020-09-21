'use strict';

const Joi = require(`@hapi/joi`);

const {schemaMessages} = require(`../messages`);
const {ECommentFieldName} = require(`../models`);


module.exports = Joi.object({
  [ECommentFieldName.TEXT]: Joi.string()
    .max(1000)
    .required()
    .messages({
      'string.max': schemaMessages.Comment.MAX_TEXT_LENGTH,
      'any.required': schemaMessages.Comment.REQUIRED_FIELD,
      'string.empty': schemaMessages.Comment.REQUIRED_FIELD,
    }),
});