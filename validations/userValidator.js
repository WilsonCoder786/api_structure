const { ROLES } = require("../utils/constants");
const Joi = require("joi")

exports.registerUserValidation = Joi.object({
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required.',
        'string.empty': 'Email cannot be empty.',
        'string.email': 'Email must be a valid email address.'
    }),
    password: Joi.string().min(5).max(30).required().messages({
        'any.required': 'Password is required.',
        'string.empty': 'Password cannot be empty.',
        'string.min': 'Password must be at least {#limit} characters long.',
        'string.max': 'Password must be less than or equal to {#limit} characters long.'
    }),
    role: Joi.string().valid(ROLES.USER, ROLES.ORGANIZATION, ROLES.ADMIN).default(ROLES.USER).required(),
    deviceToken: Joi.string().optional(),
    deviceType: Joi.string().optional()
}).messages({
    'object.unknown': 'Invalid field {#label}'
});