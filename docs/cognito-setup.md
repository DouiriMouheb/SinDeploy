# AWS Cognito Setup Guide

## 🎯 Current Status: FAKE/DEV Configuration

We're currently using **fake Cognito configuration** for learning and development purposes. This document outlines both the fake setup and the real AWS setup process.

## 📋 Fake Configuration (Current)

### Environment Variables (Fake Data)
```bash
# Frontend (.env)
VITE_AWS_REGION=eu-south-1
VITE_COGNITO_USER_POOL_ID=eu-south-1_XXXXXXXXX
VITE_COGNITO_APP_CLIENT_ID=abcdefghijklmnopqrstuvwxyz
VITE_COGNITO_IDENTITY_POOL_ID=eu-west-1:12345678-1234-1234-1234-123456789012
VITE_COGNITO_DOMAIN=sindeploy-dev-auth

# Backend (.env)
AWS_REGION=eu-west-1
COGNITO_USER_POOL_ID=eu-west-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=abcdefghijklmnopqrstuvwxyz
COGNITO_IDENTITY_POOL_ID=eu-west-1:12345678-1234-1234-1234-123456789012
```

### Fake User Pool Configuration
```json
{
  "UserPoolName": "SinDeploy-UserPool-Dev",
  "UserPoolId": "eu-west-1_XXXXXXXXX",
  "AppClientId": "abcdefghijklmnopqrstuvwxyz",
  "Region": "eu-west-1",
  "Domain": "sindeploy-dev-auth"
}
```

## 🚀 Real AWS Cognito Setup Process

### Step 1: Create User Pool
1. Go to AWS Console → Cognito
2. Click "Create User Pool"
3. Configure the following:

#### Authentication Providers
- **Username**: Email address
- **Password**: Custom password policy
  - Minimum length: 8 characters
  - Require uppercase letters: Yes
  - Require lowercase letters: Yes
  - Require numbers: Yes
  - Require special characters: No

#### User Attributes
- **Required attributes**: email, given_name, family_name
- **Custom attributes**: custom:role (String, Mutable)

#### Email Configuration
- **Email provider**: Amazon SES or Cognito default
- **From email address**: noreply@yourdomain.com
- **Reply-to email address**: support@yourdomain.com

### Step 2: Create App Client
1. In User Pool → App integration
2. Create app client with:
   - **Client name**: SinDeploy-WebApp
   - **Authentication flows**: 
     - ALLOW_USER_SRP_AUTH
     - ALLOW_REFRESH_TOKEN_AUTH
   - **Token expiration**:
     - Access token: 1 hour
     - ID token: 1 hour
     - Refresh token: 30 days

### Step 3: Configure Domain (Optional)
1. User Pool → App integration → Domain
2. Choose domain prefix: `sindeploy-auth`
3. Full domain: `sindeploy-auth.auth.eu-west-1.amazoncognito.com`

### Step 4: Update Environment Variables
Replace fake values with real ones:
```bash
VITE_AWS_REGION=eu-west-1
VITE_COGNITO_USER_POOL_ID=eu-west-1_AbCdEfGhI  # Real User Pool ID
VITE_COGNITO_APP_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j  # Real App Client ID
VITE_COGNITO_DOMAIN=sindeploy-auth  # Real domain prefix
```

## 🔧 Test Users (Development)

### Admin User (Pre-created by Administrator)
- **Email**: admin@sindeploy.com
- **Password**: TempPass123!
- **Attributes**:
  - given_name: Admin
  - family_name: User
  - custom:role: admin

### Regular User (Pre-created by Administrator)
- **Email**: user@sindeploy.com
- **Password**: TempPass123!
- **Attributes**:
  - given_name: Regular
  - family_name: User
  - custom:role: user

**Note**: Users cannot create their own accounts. All accounts must be created by system administrators through the AWS Cognito console or admin APIs.

## 📊 User Pool Schema

### Standard Attributes
| Attribute | Type | Required | Mutable |
|-----------|------|----------|---------|
| email | String | Yes | Yes |
| given_name | String | Yes | Yes |
| family_name | String | Yes | Yes |
| email_verified | Boolean | No | Yes |

### Custom Attributes
| Attribute | Type | Required | Mutable |
|-----------|------|----------|---------|
| custom:role | String | No | Yes |

## 🔐 Security Configuration

### Password Policy
- Minimum length: 8 characters
- Require uppercase: Yes
- Require lowercase: Yes
- Require numbers: Yes
- Require symbols: No
- Temporary password validity: 7 days

### MFA Configuration
- **Status**: Optional
- **Methods**: SMS, TOTP
- **Backup**: Recovery codes

### Account Recovery
- **Methods**: Email
- **Message**: Custom email template

## 🌐 OAuth & Social Logins (Future)

### Supported Providers
- Google
- Facebook
- Amazon
- Apple
- SAML
- OIDC

### OAuth Scopes
- openid
- email
- profile
- aws.cognito.signin.user.admin

## 📝 Next Steps

1. **Phase 1**: Continue with fake configuration for development
2. **Phase 2**: Create real AWS Cognito User Pool
3. **Phase 3**: Update environment variables with real values
4. **Phase 4**: Test with real Cognito integration
5. **Phase 5**: Deploy to production

## 🚨 Important Notes

- **Cost**: AWS Cognito free tier includes 50,000 MAUs
- **Region**: Choose region closest to users (eu-west-1 for Europe)
- **Backup**: Enable deletion protection in production
- **Monitoring**: Set up CloudWatch alarms for failed logins
- **Compliance**: Cognito is SOC, PCI DSS, HIPAA compliant
