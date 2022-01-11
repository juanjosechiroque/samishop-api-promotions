const request = require("supertest");
const app = require("../app");

describe('Validate promotions, with invalid request',  () => {

    it('when request is empty', async () => {

        const response = await request(app).post("/promotions");    

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeTruthy(); 
        expect(response.body.errors.length).toBe(2);
    
    });

    it('when products is not include', async () => {

        const data = {
            merchant_id: "1"
        }
        
        const response = await request(app).post("/promotions").send(data);        

        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeTruthy(); 
        expect(response.body.errors.length).toBe(1);        
    
    });

    it('when merchant_id is not include', async () => {

        const data = {
            products: [
                {
                    sku: "CAMISA001ROJOS",
                    title: "CAMISA ROJA SMALL",
                    price: 40,
                    sale_price: 30,
                    quantity: 1,
                    tag: "ALL,ROPA,CAMISA,PROMO1"
                }
            ]
        }

        const response = await request(app).post("/promotions").send(data);        
        
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeTruthy(); 
        expect(response.body.errors.length).toBe(1);        
    
    });

    it('when products item is empty', async () => {

        const data = {    
            merchant_id: "1",        
            products: [
                {
                    
                }
            ]
        }

        const response = await request(app).post("/promotions").send(data);        
        
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeTruthy(); 
        expect(response.body.errors.length).toBe(6);        
    
    });


    it('when products items are invalid', async () => {

        const data = {    
            merchant_id: "1",        
            products: [
                {
                    sku: "",
                    title: "",
                    price: "test",
                    sale_price: "test",
                    quantity: "test",
                    tag: ""
                }
            ]
        }

        const response = await request(app).post("/promotions").send(data);        
        
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeTruthy(); 
        expect(response.body.errors.length).toBe(6);        
    
    });

    it('when sale_price is not greater to price', async () => {

        const data = {    
            merchant_id: "1",        
            products: [
                {
                    sku: "TEST",
                    title: "TEST",
                    price: "12",
                    sale_price: "15",
                    quantity: "1",
                    tag: "TEST"
                }
            ]
        }

        const response = await request(app).post("/promotions").send(data);        
        
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeTruthy(); 
        expect(response.body.errors.length).toBe(1);        
    
    });

    
    
})


describe('Validate promotions, with right request',  () => {

    it('when there are no rules for merchant', async () => {

        const data = {
            merchant_id: "FAKE_ID",
            products: [
                {
                    sku: "CAMISA001ROJOS",
                    title: "CAMISA ROJA SMALL",
                    price: 40,
                    sale_price: 30,
                    quantity: 1,
                    tag: "ALL,ROPA,CAMISA,PROMO1"
                }
            ]
        }

        const response = await request(app).post("/promotions").send(data);        
            
        console.log(response.body);

        expect(response.statusCode).toBe(200);      
        expect(response.body.products).toBeTruthy();
        expect(response.body.summary).toBeTruthy(); 
    
    });
   

    it('when there are active rules for merchant', async () => {

        const data = {
            merchant_id: "1",
            products: [
                {
                    sku: "CAMISA001ROJOS",
                    title: "CAMISA ROJA SMALL",
                    price: 40,
                    sale_price: 30,
                    quantity: 1,
                    tag: "ALL,ROPA,CAMISA,PROMO1"
                },
                {
                    sku: "CAMISAAZULL",
                    title: "CAMISA AZUL L",
                    price: 90,
                    sale_price: 80,
                    quantity: 1,
                    tag: "ALL,ROPA,CAMISA"
                },
                {
                    sku: "ZAPATILLAS00139",
                    title: "ZAPATILLAS 39",
                    price: 160,
                    sale_price: 150,
                    quantity: 2,
                    tag: "ALL,ZAPATILLAS,NIKE,REG1"
                }
            ]
        }

        const response = await request(app).post("/promotions").send(data);        
        
        expect(response.statusCode).toBe(200);
        expect(response.body.products).toBeTruthy();
        expect(response.body.summary).toBeTruthy(); 
        expect(response.body.products.some(x => 'promo' in x)).toBe(true);

    });


})