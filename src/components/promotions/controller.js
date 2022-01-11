const promotionDao = require("./dao");
const { runValidations } = require('./validations');

function unCompressList(lsProducts) {
    
    let result = [];
    let itemLength = 0;

    lsProducts.forEach(item => {
        
        if (item.quantity == 1) {
            result.push(item);
        } else {

            itemLength = item.quantity;
            
            for (let i = 1; i <= itemLength; i++) {
                item.quantity = 1;
                result.push({...item});
            }
        }

    });
   
    return result;
}

function compressList(lsProducts) {
 
    let result = [];
    let times = 0;

    lsProducts.forEach(product => {

        times = result.filter(item => product.sku == item.sku && product.sale_price == item.sale_price);
        
        if (times.length == 0) {
            product.quantity = lsProducts.filter(item => item.sku == product.sku && item.sale_price == product.sale_price).length;
            result.push({...product});
        }
        
    });

    return result;

}

function isDateAvailable(dateStart, dateEnd) {    
    let dateNow = new Date();    
    return dateNow > new Date(dateStart) && dateNow <= new Date(dateEnd);
}

async function getRulesToEvalute(merchant_id, coupon) {
    
    let query = {};
    query.merchant_id = merchant_id;

    if (coupon) query.coupon = coupon;

    let lsRules = await promotionDao.getRulesByMerchantId(query);
    
    lsRules = lsRules.filter(x => x.status == 1);

    let dateNow = new Date();

    lsRules = lsRules.filter(x => isDateAvailable(x.startDate, x.endDate));

    return lsRules;

}

function isRuleApplied(rule, lsProducts) {
    
    let result = false;

    lsTagFiltered = lsProducts.filter(x => x.tag.includes(rule.tag));

    let ranges = rule.range.split("-");

    lsQyPriceFiltered = lsTagFiltered.filter(x => x.price >= ranges[0] && x.price <= ranges[1] ); 
   
    if (lsQyPriceFiltered.length >= rule.tag_quantity) {
        result = true; 
    }

    return result;
}

function updateListProducs(rule, lsProducts) {   
    
    let result = lsProducts.map(p => {return {...p} });
    
    let lsTagFiltered = result.filter(x => x.tag.includes(rule.discount_tag));

    lsTagFiltered.sort((a,b) => a.sale_price - b.sale_price);
  
    if (rule.discount_quantity != 0) {
        lsTagFiltered = lsTagFiltered.slice(0, rule.discount_quantity);
    }
    
    lsTagFiltered.forEach(item => {

        if(rule.discount_over == "PRICE" ) {
            item.sale_price = item.price - ( item.price * (rule.discount_amount / 100.00) );
        } else {            
            item.sale_price = item.sale_price - ( item.sale_price * (rule.discount_amount / 100.00) );
        }

        item.promo = rule.name;

    });

    return result;
}

function getSummary(lsProducts) {

    let summary = {};

    let subTotal = 0;
    let disccount = 0;
    let quantity = 0;

    lsProducts.forEach(product => {
        subTotal += product.price * product.quantity;
        disccount += (product.price * product.quantity) - (product.sale_price * product.quantity);
        quantity += product.quantity;
    });

    summary.subTotal = subTotal;
    summary.disccount = disccount;
    summary.quantity = quantity;
    summary.total = subTotal - disccount;   

    return summary;
    
}

function getTotalCart(lsProducts){

    let result = 0;

    lsProducts.forEach(product => {
       result += product.sale_price;
    });

    return result;

}

function getCheapestCart(lsCarts) {

    let minCart = 9999;
    let totalCart = 0;    
    let result = [];

    lsCarts.forEach(lsProducts => {

        totalCart = getTotalCart(lsProducts);      

        if (totalCart < minCart) {
            minCart = totalCart;            
            result = lsProducts;
        }
        
    });

    return result;
    
}

module.exports = {

    async validatePromotions(req, res) {

        try { 

            const lsErrors = runValidations(req.body);
            
            if (lsErrors.length != 0) return res.status(400).send({errors: lsErrors});

            const lsProducts = unCompressList(req.body.products);
        
            const { merchant_id, coupon } = req.body;

            const lsRules = await getRulesToEvalute(merchant_id, coupon);

            if (lsRules.length == 0) {

                console.log(`No se encontró reglas para el merchant_id ${merchant_id}`);

                return res.json({
                    products: lsProducts,
                    summary: getSummary(lsProducts)
                });

            }
            
            console.log("Reglas para evaluar: ", lsRules.length);

            let lsCarts = [];
            let totalCart = 0;

            lsRules.forEach(rule => {
            
                if (isRuleApplied(rule, lsProducts)) {
                    
                    productsAfterRule = updateListProducs(rule, lsProducts);

                    totalCart = getTotalCart(productsAfterRule);

                    console.log(`Regla: ${rule.name} | TotalCart: ${totalCart}`);
                    
                    lsCarts.push(productsAfterRule);            
                }
                
            });
            
            let cheapestCart  = {};
            
            if(lsCarts.length == 1 ) {
                cheapestCart = lsCarts[0];
            } else {
                cheapestCart = getCheapestCart(lsCarts);
            }
            
            cheapestCart = compressList(cheapestCart);

            cheapestCart.forEach(product => {
                product.subtotal = product.sale_price * product.quantity;
            });

            let result = {
                products: cheapestCart,
                summary: getSummary(cheapestCart)
            };

            return res.json(result);

        } catch(err) {
            console.log('[response error]', err.message);
            return res.sendStatus(500);
        }

    }
}