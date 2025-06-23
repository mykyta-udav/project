interface JWTPayload {
  sub: string;
  'cognito:groups': string[];
  email_verified: boolean;
  'custom:lastName': string;
  iss: string;
  'cognito:username': string;
  origin_jti: string;
  aud: string;
  event_id: string;
  'custom:firstName': string;
  token_use: string;
  auth_time: number;
  exp: number;
  iat: number;
  jti: string;
  email: string;
}

/**
 * Decode JWT token without verification (client-side only)
 * WARNING: This is only for reading token data, not for verification!
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    const payload = parts[1];
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decodedPayload = atob(paddedPayload);
    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Extract user information from AWS Cognito JWT token
 */
export const extractUserFromToken = (token: string, email: string): {
  username: string;
  firstName: string;
  lastName: string;
  role: string;
} | null => {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  const firstName = payload['custom:firstName'] || '';
  const lastName = payload['custom:lastName'] || '';
  const username = `${firstName} ${lastName}`.trim() || email;
  
  // Extract role from cognito:groups (first group)
  const role = payload['cognito:groups']?.[0] || 'Customer';

  return {
    username,
    firstName,
    lastName,
    role,
  };
}; 