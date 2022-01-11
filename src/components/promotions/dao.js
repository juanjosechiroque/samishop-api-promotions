const Promotion = require("./model");

module.exports = {
    
    async getRulesByMerchantId(query) {
           
        const lsPromotions = await Promotion.find(query);        
        return lsPromotions;          
    }
    
}
