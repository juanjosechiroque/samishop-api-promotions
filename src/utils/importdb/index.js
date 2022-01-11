if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

require("../../db.js");
const Promotion = require("../../components/promotions/model.js");

async function importData() {
    
    const lsPromotions = require("./rulesDB.json");

    let promoExists = [];

    for (const promo of lsPromotions) {

        promoExists = await Promotion.find({ merchant_id: promo.merchant_id, name: promo.name });
        
        if (promoExists.length != 0) {            
            console.log(`Existe promoción con mismo merchant_id:${promo.merchant_id} y name:${promo.name}`); 
            continue;
        }
            
        promotion = new Promotion(promo);      
        promotion.save();
        console.log("promotion inserted");
        
    }

}

async function deleteAll() {

    let result = await Promotion.deleteMany({ merchant_id: "TEST"});    
    console.log("Collection deleted");
}

async function listPromotions() {

    let results = await Promotion.find({ merchant_id: "TEST"});    
    console.log("Results: " + results.length);
    console.log(results);
}

//importData();
//deleteAll();
//listPromotions();
