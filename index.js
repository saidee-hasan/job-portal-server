const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId, serialize } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(cookieParser())
app.use(cors( {
  origin: ['http://localhost:5173','https://rooms-booking.netlify.app'],
  credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));
require("dotenv").config();
const verifyToken = (req,res,next)=>{
  const token = req?.cookies?.token;
  if(!token){
   return res.status(401).send({massage:'Unauthorized access'})
  }
 // verify token
 jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
   if(err){
     return res.status(401).send({massage:'Unauthorized access'})
    }
    req.user= decoded
    next()
 })
 
 }
 


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
    app.post('/logout',async(req,res)=>{
      res.cookie('token',{
        httOnly : true,
        secure:process.env.NODE_ENV === 'production',
        sameSite:process.env.NODE_ENV === 'production' ? 'none': "strict",
    
      })
      .send({success:true})
    })
    

    app.get("/jobs", async (req, res) => {
      const email = req.query.email;
      let query = {};
      const {sort}=req.query;
      const {search} = req.query;
      console.log(search)
let sortQuery = {}
      if(sort == "true"){
        sortQuery = {'salaryRange.min':-1}
      }
      if(search){
        query.location={$regex:search,$options:'i'}
      }
      if (email) {
        query = {
          hr_email: email,
        };
      }
      console.log(query)

      const cursor = jobsCollection.find(query).sort(sortQuery);
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

    app.get("/jobs-application",verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      if(req.user.email !== email){
        return res.status(403).send({ message: 'Forbidden access' });
      }
 
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
