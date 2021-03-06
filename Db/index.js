//  REQUIRE
const mongoose = require('mongoose');
const algoliasearch = require('algoliasearch');

const { User, Trip, Spot, Fork } = require('./schema.js');
// const { updateUpvote } = require('./algoliaSearch.js');

// FOR .ENV VARIABLES
require('dotenv').config();
// MONGOOSE PROMISES DEPRICATED IMPORT PROMISE
mongoose.Promise = require('bluebird');
// CONNECT MONGOOSE TO LOCAL HOST OR MLAB

mongoose.connect(
  `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ds059546.mlab.com:59546/peri2`,
  {mongoUseClient: true});


// mongoose.connect('mongodb://localhost/3000/peri', { mongoUseClient: true });

const db = mongoose.connection;
// CONNECTION
db.on('error', console.error.bind(console, 'connection error:'));
db.once('openUri', () => {
  console.log('Successfully connected to database.');
});

const saveNewUser = (data) => {

  const newUser = new User({
    username: data.username,
    sessionID: data.sessionID
  });

  newUser.save((err) => {
    if (err) {
      return err;
    } else {
      console.log('successfully saved to the database.');
    }
  });

};

// SAVES NEW TRIP AND SPOTS WITH IDS
const saveNewTrip = (data, cb) => {
  // find the user to make sure we have the correct user
  User.find({username: data.username}, (err, user) => {
    if (err) {
      console.log('could not find the user'); //will add a callback here later
    } else {
    // create a new trip
      const newTrip = new Trip({
        username: data.username,
        tripName: data.tripName,
        destination: data.destination,
        description: data.description,
        hashtag: data.hashtag,
        thumbnail: data.thumbnail,
        spots: [],
        upvotes: 1
      });

      // Save the new trip
      newTrip.save((err) => {
        if (err) {
          return cb(err, null);
        } else {
          console.log('succesfully saved trip'); // will add callback ehre later

          cb(null, true);

          // loop through the spots that was given
          data.spots.map((spot) => {
            // create a new spot
            const newSpot = new Spot({
              // add the tripID into each new spot
              tripID: newTrip._id,
              spotName: spot.spotName,
              description: spot.description,
              long: spot.long,
              lat: spot.lat,
              elevation: spot.elevation,
              photo: spot.photo
            });
            // before we save new spot, search for the trip and add the spots into Trip
            Trip.findById(newTrip._id, (err, trip) => {
              if (err) {
                return err;
              } else {
                trip.spots.push(newSpot._id);
                trip.save((err) => {
                  if (err) {
                    console.log('error saving the individual spot to the trip');
                  } else {
                    console.log('successfully saved spotID to the trip');
                    newSpot.save((err) => {
                      if (err) {
                        return err;
                      } else {
                        console.log('succesfully saved spot');
                      }
                    });
                  }
                });
              }
            });
            // save the spot
          });
        }
      });
    }
  });
};

const getNewestTrip = (cb) => {
  Trip.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec((err, trip) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, trip);
    }
  });
};

const getTrips = (cb) => {
  Trip.find({}, (err, trips) => {
    if (err) {
      cb(err, null);
    } else {
      cb(err, trips);
    }
  });
};

const getSpots = (tripId, cb) => {
  Spot.find({'tripID': tripId}, (err, spots) => {
    if (err) {
      cb(err, null);
    } else {
      cb(err, spots);
    }
  });
};

const getAllSpots = (cb) => { //Rework to Trips when enough trips for infinite scroll
  Spot.find({}, (err, spots) => {
    if (err) {
      cb(err, null);
    } else {
      cb(err, spots);
    }
  });
};

const updateUpvotesDB = (data, cb) => {
  Trip.findOne({'_id': data.objectID}, (err, trip) => {
    if (err) {
      cb(err, null);
    } else {
      let oldTrip = Object.assign({}, trip);
      trip.upvotes++;
      console.log('Does this line rune 162');
      updateUpvote(oldTrip, trip);
      Trip.save((err) => {
        if (err) {
          cb(err, null);
        } else {
          cb(null, true);
        }
      });
    }
  });
};

module.exports.saveNewUser = saveNewUser;
module.exports.saveNewTrip = saveNewTrip;
module.exports.getTrips = getTrips;
module.exports.getSpots = getSpots;
module.exports.getAllSpots = getAllSpots;
module.exports.getNewestTrip = getNewestTrip;
module.exports.updateUpvotesDB = updateUpvotesDB;
