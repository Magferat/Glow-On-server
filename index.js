const express = require('express');
const app = express();
require('dotenv').config();

const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

// Middlewere 

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1rrt8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("SkincareAndCo");
        const productsCollection = database.collection("products");
        const orderCollection = database.collection("orders");

        // Post API 
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        })
        // Get API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // GET single Product by id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting a item', id);
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })
        // Post Product's Order 
        app.post('/orders', async (req, res) => {
            const orderProduct = req.body;
            result = await orderCollection.insertOne(orderProduct);
            console.log(orderProduct);
            res.json(result);

        })
        // Get All Orders
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        });

        // Get Specific User's Order 
        app.get('/userOrders/:email', async (req, res) => {
            const email = req.params.email;
            const cursor = orderCollection.find({ email: email });
            const order = await cursor.toArray();
            res.send(order);
            console.log(email)
        })

        //-------delete -------
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            console.log('Order Deleted', id)
            res.json(result);

        })
        // //   UPDATE API
        //Get Single Order
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await orderCollection.findOne(query);
            res.send(item);
        })
        // app.put('/orders/:id', async (req, res) => {
        //     const id = req.params.id;
        //     // const updatedStatus = req.body;
        //     // const options = { upsert: true };
        //     const query = { _id: ObjectId(id) };
        //     // const item = await orderCollection.findOne(query);
        //     const update = {
        //         $set: {
        //             status: "Approved"
        //         }

        //     };
        //     const result = await orderCollection.updateOne(query, update)
        //     console.log('updating', id)
        //     res.json(result)
        // })
    }
    finally {
        //   await client.close();
    }
}
run().catch(console.dir);

//check
app.get('/', (req, res) => {
    res.send('RUNNING SERVER')
});
app.listen(port, () => {
    console.log('running on port', port)
})

