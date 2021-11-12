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
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("SkincareAndCo");
        const productsCollection = database.collection("products");
        const orderCollection = database.collection("orders");
        const usersCollection = database.collection("users");
        const reviewsCollection = database.collection("reviews");

        // Post API 
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
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
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })
        // Post Product's Order 
        app.post('/orders', async (req, res) => {
            const orderProduct = req.body;
            result = await orderCollection.insertOne(orderProduct);
            res.json(result);

        })
        // Get All Orders
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        });

        // Get single User's Order by Email
        app.get('/userOrders/:email', async (req, res) => {
            const email = req.params.email;
            const cursor = orderCollection.find({ email: email });
            const order = await cursor.toArray();
            res.send(order);
            console.log(email)
        })

        // POST user's Data 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        //STORE users 
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        // Make admin 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // Find Admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //POST Review 

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            result = await reviewsCollection.insertOne(review);
            res.json(result);

        })
        // Get All Review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const review = await cursor.toArray();
            res.send(review);
        });


        //Get Single Order
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await orderCollection.findOne(query);
            res.send(item);
        })
        // DELETE Orders
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.json(result);

        })
        // Delete Products 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);

        })


        //   UPDATE status
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const update = {
                $set: {
                    status: "Shipped"
                }
            };
            const result = await orderCollection.updateOne(query, update)
            res.json(result)
        })
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

