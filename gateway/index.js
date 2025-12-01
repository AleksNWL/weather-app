import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

const typeDefs = gql`
  type Weather {
    city: String
    temperature: Float
    description: String
  }

  type Query {
    getWeather(city: String!): Weather
  }
`;

const resolvers = {
  Query: {
    getWeather: async (_, { city }) => {
      const res = await fetch(`http://weather-service:4001/weather/${city}`);
      const data = await res.json();
      return data;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();
server.applyMiddleware({ app });

app.listen(4000, () => console.log(`Gateway running on port 4000`));
