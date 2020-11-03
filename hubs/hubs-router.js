const express = require('express');

const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();

router.use((req, res, next) => {
  console.log("in the router middleware")
  next()
})

// this only runs if the url has /api/hubs in it
router.get('/', (req, res) => {
  Hubs.find(req.query)
    .then(hubs => {
      res.status(200).json(hubs);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error retrieving the hubs',
      });
    });
});

// /api/hubs/:id

function getIdHandler(req, res) {
  res.status(200).json(req.hub)
}

// function getIdHandler(req, res) {
//   Hubs.findById(req.params.id)
//   .then(hub => {
//     if (hub) {
//       res.status(200).json(hub);
//     } else {
//       res.status(404).json({ message: 'Hub not found' });
//     }
//   })
//   .catch(error => {
//     // log error to server
//     console.log(error);
//     res.status(500).json({
//       message: 'Error retrieving the hub',
//     });
//   });
// }

// You can pass multiple middleware custom functions (in-line or using a callback/s)

router.get('/:id', validateId, getIdHandler)

router.post('/', validateBody, (req, res) => {
  Hubs.add(req.body)
    .then(hub => {
      res.status(201).json(hub);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error adding the hub',
      });
    });
});

// Add the `validateId` to any http call that has an :id

router.delete('/:id', validateId, (req, res) => {
  Hubs.remove(req.params.id)
    .then(count => {
      if (count > 0) {
        res.status(200).json({ message: 'The hub has been nuked' });
      } else {
        res.status(404).json({ message: 'The hub could not be found' });
      }
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error removing the hub',
      });
    });
});

router.put('/:id', validateBody, (req, res) => {
  Hubs.update(req.params.id, req.body)
    .then(hub => {
      if (hub) {
        res.status(200).json(hub);
      } else {
        res.status(404).json({ message: 'The hub could not be found' });
      }
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error updating the hub',
      });
    });
});

// add an endpoint that returns all the messages for a hub
// this is a sub-route or sub-resource
router.get('/:id/messages', (req, res) => {
  Hubs.findHubMessages(req.params.id)
    .then(messages => {
      res.status(200).json(messages);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error getting the messages for the hub',
      });
    });
});

// add an endpoint for adding new message to a hub
router.post('/:id/messages', validateId, validateBody, (req, res) => {
  const messageInfo = { ...req.body, hub_id: req.params.id };

  Messages.add(messageInfo)
    .then(message => {
      res.status(210).json(message);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error getting the messages for the hub',
      });
    });
});

function validateId(req, res, next) {
  const { id } = req.params
  Hubs.findById(id)
  .then(hub => {
    if(hub) {
      req.hub = hub
      next()
    } else {
      res.status(404).json({ message: "hub id not found" })
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({ message: "db error processing request" })
  })
}

function validateBody(req, res, next) {
  console.log("Validating body ", validateId)
  // const body = req.body
  // console.log("Body ", body)
  if(req.body && Object.keys(req.body).length > 0) {
    next()
  } else {
    next({ code: 400, message: "no body" }) 
    // res.status(400).json({ message: "no body" })
  }
}

module.exports = router;
