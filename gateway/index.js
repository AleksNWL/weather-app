import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
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
      try {
        const res = await fetch(`http://weather-service:4001/weather/${city}`);
        if (!res.ok) throw new Error(`Weather service error: ${res.status}`);
        const data = await res.json();
        return data;
      } catch (err) {
        console.error(err);
        return null;
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();
server.applyMiddleware({ app, path: '/graphql' });

app.listen(4000, () => console.log(`Gateway running on http://localhost:4000/graphql`));
