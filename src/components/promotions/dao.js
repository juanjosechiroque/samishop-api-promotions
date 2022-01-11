const Promotion = require("./model");

module.exports = {
    
    async getRulesByMerchantId(merchant_id) {

        const lsPromotions = await Promotion.find({merchant_id: merchant_id});        
        return lsPromotions;          
    }
    
}
