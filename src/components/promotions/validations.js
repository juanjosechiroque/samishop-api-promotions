const Joi = require("joi");

const runSchema = Joi.object().keys({
    merchant_id: Joi.string().required(),
    coupon: Joi.string(),
    products: Joi.array().min(1).items(Joi.object().keys({ 
        sku: Joi.string().min(1).required(), 
        title: Joi.string().min(1).required(),
        quantity: Joi.number().integer().min(1).max(100).required(), 
        price: Joi.number().positive().greater(0).greater(Joi.ref('sale_price')).required(),        
        sale_price: Joi.number().positive().greater(0).required(), 
        tag: Joi.string().min(1).required(),
    })).required()
})

module.exports = {

    runValidations(req) {  
        
        let result = [];

        const validations = runSchema.validate(req, { abortEarly: false });        
        
        if(validations.error && validations.error.details)
            result = validations.error.details.map(x => x.message);        
        
        return result;
    }
}

