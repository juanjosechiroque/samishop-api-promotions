const mongoose = require("mongoose");

const { Schema } = mongoose;

const promotionSchema = new Schema({
    merchant_id: { type: String },
    name: { type: String },
    range: { type: String },
    tag_quantity: { type: Number },
    tag: { type: String },
    discount_quantity: { type: Number },
    discount_tag: { type: String },
    discount_amount: { type: Number },
    discount_over: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    status: { type: Number },
});

module.exports = mongoose.model("Promotion", promotionSchema, "promotions");
