import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';

import { Strategy } from 'passport-local';
import passport from 'passport';
import crypto from 'crypto';

import Resort from './models/resort.js';
import User from './models/user.js';

const dbString =
  'mongodb+srv://redroveruser:oF4ejqLD7IOrn9s9@cluster0.e62xs.mongodb.net/redrover?retryWrites=true&w=majority';

mongoose.set('strictQuery', true);

const typeDefs = readFileSync('./src/schema.graphql', 'utf8');

const populateResortCounts = (resort) => {
  resort.reviewsCount = resort.reviews.length;
  resort.accommodationsCount = resort.accommodations.length;
  resort.amenitiesCount = resort.amenities.length;
  resort.nearbyAttractionsCount = resort.nearbyAttractions.length;
  resort.faqsCount = resort.faqs.length;
  resort.localActivitiesCount = resort.localActivities.length;
  resort.eventsCount = resort.events.length;
  resort.imagesCount = resort.images.length;
  return resort;
};

const resolver = {
  Query: {
    async resorts(_parent, _args, _context, _info) {
      return await Resort.find().then((resorts) => {
        return resorts.map((resort) => {
          return populateResortCounts(resort);
        });
      });
    },
    resort(_, { id }, _context, _info) {
      return Resort.findOne({ _id: id }).then((resort) => {
        return populateResortCounts(resort);
      });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers: resolver,
});

const setPassport = () => {
  passport.use(
    new Strategy(async function verify(username, password, cb) {
      const user = await User.findOne({ username: username });

      if (!user) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }

      if (user.password !== password) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }

      crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
        if (err) {
          return cb(err);
        }
        if (!crypto.timingSafeEqual(user.password as any, hashedPassword)) {
          return cb(null, false, { message: 'Incorrect username or password.' });
        }
        return cb(null, user);
      });
    })
  );
};

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    setPassport();
    const db = await mongoose.connect(dbString);
    return { db };
  },
});

console.log(`🚀 Server ready at ${url}`);
