const express = require('express'); // importing a CommonJS module
const morgan = require("morgan")
const cors = require("cors")
const helmet = require("helmet")

const hubsRouter = require('./hubs/hubs-router.js');

const server = express();

server.use(express.json());
server.use(cors())
// server.use(morgan("dev"))
server.use(methodLogger)
server.use(addName)
server.use(helmet())
// server.use(lockout)
// server.use(moddyLockout)


server.use('/api/hubs', hubsRouter);

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
  `);
});

//Custom middleware functions

function methodLogger(req, res, next) {
  console.log(`${req.method} Request`)
  next()
}

function addName(req, res, next) {
  req.name = req.headers["x-name"]
  req.name = req.name || "Cassandra" //Alternative to tertiary operation
  next()
}

function lockout(req, res, next) {
  res.status(403).json({ message: "api down" })
}

function moddyLockout(req, res, next) {
  const date = new Date()
  const seconds = date.getSeconds()
  if(seconds % 3 === 0) {
    res.status(500).json({ message: "error", seconds: seconds })
  } else {
    next()
  }

}

// Error handler middleware custom

function errorHandler(error, req, res, next) {
  console.log("Error handler ", error)
  if (error.code) {
    res.status(error.code).json(error.message)

  } else {
  res.status(400).json({ message: "...." })    
  }
}

//Add error handler middleware at the end

server.use(errorHandler)

module.exports = server;
