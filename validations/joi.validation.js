const Joi = require("joi");

const SchemaElements = {
    email: Joi.string().email().required(),
    username: Joi.string().min(3).max(30).required(),
    name: Joi.string().min(3).max(30).required(),
    password: Joi.string()
        .min(8)
        .required()
        .regex(/^(?=.*[a-z])/)
        .regex(/^(?=.*[A-Z])/)
        .regex(/^(?=.*\d)/)
        .regex(/^(?=.*[@$!%*?&])/),
    cost :Joi.number().required(),
    path: Joi.string().required(),
    count:Joi.number().required(),
        
};

function creatingSchema(data) {
    return Joi.object(data);
}

const Validate = (schma, data) => {
  const { error, value } = creatingSchema(schma).validate(data);
  if (error) return { status: false, response: error.details };
  else return { status: true, response: value };
};

const GlobalSchema = () => {
    return SchemaElements;
};



module.exports = {
    Validate,
    GlobalSchema,
};
