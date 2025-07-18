// Server/config/cognito.js - AWS Cognito Configuration for Backend
require('dotenv').config();

const cognitoConfig = {
  // AWS Region
  region: process.env.AWS_REGION || 'eu-west-1',
  
  // User Pool Configuration
  userPoolId: process.env.COGNITO_USER_POOL_ID || 'eu-west-1_XXXXXXXXX',
  clientId: process.env.COGNITO_APP_CLIENT_ID || 'abcdefghijklmnopqrstuvwxyz',
  
  // Identity Pool (optional)
  identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID || 'eu-west-1:12345678-1234-1234-1234-123456789012',
  
  // JWT Configuration
  jwt: {
    // Token types to verify
    tokenUse: ['access', 'id'], // access token for API calls, id token for user info
    
    // JWT Issuer (automatically constructed)
    issuer: `https://cognito-idp.${process.env.AWS_REGION || 'eu-west-1'}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID || 'eu-west-1_XXXXXXXXX'}`,
    
    // JWT Audience (should match client ID)
    audience: process.env.COGNITO_APP_CLIENT_ID || 'abcdefghijklmnopqrstuvwxyz',
    
    // Token expiration tolerance (in seconds)
    clockTolerance: 300, // 5 minutes
    
    // Cache JWKS for performance
    jwksCache: true,
    jwksCacheMaxEntries: 5,
    jwksCacheMaxAge: 600000 // 10 minutes
  },
  
  // User Attributes Mapping
  attributeMapping: {
    // Cognito attribute -> Local database field
    'sub': 'cognitoId',
    'email': 'email',
    'given_name': 'firstName',
    'family_name': 'lastName',
    'custom:role': 'role',
    'email_verified': 'emailVerified'
  },
  
  // Default User Attributes for new users
  defaultAttributes: {
    role: 'user',
    isActive: true,
    emailVerified: false
  }
};

// Development/Testing Configuration
const devConfig = {
  // Mock Cognito responses for development
  mockMode: process.env.NODE_ENV === 'development' && process.env.COGNITO_MOCK_MODE === 'true',
  
  // Fake JWT tokens for testing
  fakeTokens: {
    validAccessToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.fake-signature',
    validIdToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9.fake-signature'
  },
  
  // Test user data
  testUsers: [
    {
      cognitoId: 'test-admin-123',
      email: 'admin@sindeploy.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    },
    {
      cognitoId: 'test-user-456',
      email: 'user@sindeploy.com',
      firstName: 'Regular',
      lastName: 'User',
      role: 'user'
    }
  ]
};

// AWS SDK Configuration
const awsConfig = {
  region: cognitoConfig.region,
  credentials: {
    // For development, we'll use environment variables or IAM roles
    // In production, use IAM roles or AWS credentials
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

// Export configurations
module.exports = {
  cognitoConfig,
  devConfig,
  awsConfig,
  
  // Helper function to get JWKS URI
  getJwksUri: () => {
    return `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}/.well-known/jwks.json`;
  },
  
  // Helper function to get issuer
  getIssuer: () => {
    return cognitoConfig.jwt.issuer;
  },
  
  // Helper function to check if in mock mode
  isMockMode: () => {
    return devConfig.mockMode;
  }
};
