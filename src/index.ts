import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';

import mongoose from 'mongoose';
import { readFileSync } from 'fs';

import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwt from 'jsonwebtoken';

import Resort from './models/resort.js';
import User from './models/user.js';

import auth from './auth.js';
import { GraphQLError } from 'graphql';

const dbString =
  'mongodb+srv://redroveruser:oF4ejqLD7IOrn9s9@cluster0.e62xs.mongodb.net/redrover?retryWrites=true&w=majority';
mongoose.set('strictQuery', true);
const db = await mongoose.connect(dbString);

const app = express();
app.use(cors());
app.use(bodyParser.json());
const httpServer = http.createServer(app);

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
      if (!_context.user) {
        console.log('context has no user');
        throw new GraphQLError('User is not logged in', {
          extensions: {
            code: 'UNAUTHENTICATED',
            status: 401,
          },
        });
      }
      return Resort.findOne({ _id: id }).then((resort) => {
        return populateResortCounts(resort);
      });
    },
  },
};

const server = new ApolloServer({
  typeDefs: readFileSync('./src/schema.graphql', 'utf8'),
  resolvers: resolver,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(
  '/gql',
  expressMiddleware(server, {
    context: async ({ req }) => {
      let token = req.headers.authorization;
      let user = null;
      if (token) {
        token = token.split(' ')[1];
        const data: any = jwt.verify(token, 'secret');
        user = await User.findOne({ email: data.data });
        console.log('got user in gql context', user);
      }
      return { db, token: req.headers.authorization, user };
    },
  })
);

app.use(auth);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    },
    async function (jwtPayload, done) {
      try {
        console.log('jwt payload', jwtPayload);
        const user = await User.findOne({ email: jwtPayload.data });
        return done(null, user || false);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));

console.log(`🚀 Server ready at http://localhhost:4000`);
