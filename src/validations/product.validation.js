import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).optional(),
});
