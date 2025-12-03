/**
 * Format GraphQL errors for better readability
 */
export const errorFormatter = (error) => {
  console.error('GraphQL Error:', error);
  return {
    message: error.message,
    locations: error.locations,
    path: error.path
  };
};
