const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(cookieParser())
app.use(cors());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cnyhf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const jobsCollection = client.db("jobPortal").collection("jobs");
    const jobsApplicationCollection = client
      .db("jobPortal")
      .collection("jobs_application");

    app.post("/jobsApplication", async (req, res) => {
      const receivedData = req.body; // Access the data sent in the request body
      const result = await jobsApplicationCollection.insertOne(receivedData);
      res.send(result);
      console.log("Received data:", receivedData);
    });

    app.post('/jwt',(req,res)=>{
      const user =  req.body;
      const token  = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'5h'} )
      res.cookie('token',token,{
        httOnly : true,
        secure: false,
     
      })
      .send({success:true})
    })

    app.get("/jobs", async (req, res) => {
      const email = req.query.email;
      let query = {};
      if (email) {
        query = {
          hr_email: email,
        };
      }

      const cursor = jobsCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });
    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    });

    app.get("/jobs-application", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };

      const result = await jobsApplicationCollection.find(query).toArray();

      for (const application of result) {
        const query = { _id: new ObjectId(application.job_id) };
        const job = await jobsCollection.findOne(query);
        if (job) {
          (application.title = job.title),
            (application.company = job.company),
            (application.company_logo = job.company_logo);
        }
      }
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running ");
});

app.listen(port, () => {
  console.log(`Job is Counting ${port}`);
});
