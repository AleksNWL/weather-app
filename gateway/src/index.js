import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';

import { typeDefs } from './config/schema.js';
import { resolvers } from './resolvers/query.js';
import { errorFormatter } from './middleware/errorHandler.js';
import { GATEWAY_PORT, GRAPHQL_PATH } from './config/constants.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway' });
});

// Initialize Apollo Server
const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
  formatError: errorFormatter
});

// Start server and apply middleware
const startServer = async () => {
  try {
    await server.start();
    server.applyMiddleware({ app, path: GRAPHQL_PATH });

    app.listen(GATEWAY_PORT, () => {
      console.log(`🚀 Gateway running on http://localhost:${GATEWAY_PORT}${GRAPHQL_PATH}`);
      console.log(`📊 GraphQL Playground available at http://localhost:${GATEWAY_PORT}${GRAPHQL_PATH}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
