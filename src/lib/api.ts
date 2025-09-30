// Mock API functions with comprehensive error scenarios
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  requiresTwoFactor?: boolean;
  sessionId?: string;
  message?: string;
}

export interface TwoFactorRequest {
  sessionId: string;
  code: string;
}

export interface TwoFactorResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database of users for testing
const mockUsers = [
  { email: 'user@example.com', password: 'password123', requiresTwoFactor: true },
  { email: 'admin@example.com', password: 'admin123', requiresTwoFactor: false },
  { email: 'test@mail.com', password: 'test123', requiresTwoFactor: true },
];

// Mock session storage
const mockSessions = new Map<string, { email: string; timestamp: number }>();

export const loginApi = async (request: LoginRequest): Promise<LoginResponse> => {
  await delay(1000); // Simulate network delay

  // Error scenarios for testing
  const errorScenarios = {
    // Network/Server errors
    'network@error.com': () => {
      throw new Error('Network request failed');
    },
    'server@error.com': () => {
      const error = new Error('Internal server error') as any;
      error.status = 500;
      throw error;
    },
    'timeout@error.com': () => {
      return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 3000);
      });
    },
    
    // Authentication errors
    'invalid@email.com': () => {
      const error = new Error('Invalid email format') as any;
      error.status = 400;
      error.code = 'INVALID_EMAIL';
      throw error;
    },
    'notfound@user.com': () => {
      const error = new Error('User not found') as any;
      error.status = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    },
    'locked@account.com': () => {
      const error = new Error('Account is locked due to too many failed attempts') as any;
      error.status = 423;
      error.code = 'ACCOUNT_LOCKED';
      throw error;
    },
    'suspended@user.com': () => {
      const error = new Error('Account is suspended') as any;
      error.status = 403;
      error.code = 'ACCOUNT_SUSPENDED';
      throw error;
    },
    'expired@password.com': () => {
      const error = new Error('Password has expired') as any;
      error.status = 403;
      error.code = 'PASSWORD_EXPIRED';
      throw error;
    },
    
    // Rate limiting
    'ratelimit@test.com': () => {
      const error = new Error('Too many login attempts. Please try again later.') as any;
      error.status = 429;
      error.code = 'RATE_LIMIT_EXCEEDED';
      throw error;
    },
    
    // Maintenance mode
    'maintenance@test.com': () => {
      const error = new Error('Service is temporarily unavailable for maintenance') as any;
      error.status = 503;
      error.code = 'SERVICE_UNAVAILABLE';
      throw error;
    }
  };

  // Check for error scenarios
  if (errorScenarios[request.email as keyof typeof errorScenarios]) {
    await errorScenarios[request.email as keyof typeof errorScenarios]();
  }

  // Find user
  const user = mockUsers.find(u => u.email === request.email);
  
  if (!user) {
    const error = new Error('Invalid email or password') as any;
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (user.password !== request.password) {
    const error = new Error('Invalid email or password') as any;
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Generate session ID if user requires 2FA
  if (user.requiresTwoFactor) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    mockSessions.set(sessionId, { email: user.email, timestamp: Date.now() });
    
    return {
      success: true,
      requiresTwoFactor: true,
      sessionId,
      message: 'Please enter your 2FA code'
    };
  }

  // Direct login for users without 2FA
  return {
    success: true,
    requiresTwoFactor: false,
    message: 'Login successful'
  };
};

export const verifyTwoFactorApi = async (request: TwoFactorRequest): Promise<TwoFactorResponse> => {
  await delay(800);

  // Error scenarios for 2FA
  const twoFactorErrorScenarios = {
    'expired_session_12345': () => {
      const error = new Error('Session has expired. Please login again.') as any;
      error.status = 401;
      error.code = 'SESSION_EXPIRED';
      throw error;
    },
    'invalid_session_12345': () => {
      const error = new Error('Invalid session') as any;
      error.status = 400;
      error.code = 'INVALID_SESSION';
      throw error;
    }
  };

  // Check for error scenarios
  if (twoFactorErrorScenarios[request.sessionId as keyof typeof twoFactorErrorScenarios]) {
    await twoFactorErrorScenarios[request.sessionId as keyof typeof twoFactorErrorScenarios]();
  }

  // Check if session exists and is valid
  const session = mockSessions.get(request.sessionId);
  if (!session) {
    const error = new Error('Invalid or expired session') as any;
    error.status = 401;
    error.code = 'INVALID_SESSION';
    throw error;
  }

  // Check if session is expired (5 minutes)
  if (Date.now() - session.timestamp > 5 * 60 * 1000) {
    mockSessions.delete(request.sessionId);
    const error = new Error('Session has expired. Please login again.') as any;
    error.status = 401;
    error.code = 'SESSION_EXPIRED';
    throw error;
  }

  // Validate 2FA code
  const validCodes = ['123456', '131311']; // Mock valid codes
  
  // Error scenarios for 2FA codes
  if (request.code === '111111') {
    const error = new Error('Invalid verification code') as any;
    error.status = 400;
    error.code = 'INVALID_2FA_CODE';
    throw error;
  }
  
  if (request.code === '000000') {
    const error = new Error('Too many invalid attempts. Account temporarily locked.') as any;
    error.status = 423;
    error.code = 'TOO_MANY_ATTEMPTS';
    throw error;
  }

  if (!validCodes.includes(request.code)) {
    const error = new Error('Invalid verification code') as any;
    error.status = 400;
    error.code = 'INVALID_2FA_CODE';
    throw error;
  }

  // Success - cleanup session and return token
  mockSessions.delete(request.sessionId);
  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    success: true,
    token,
    message: 'Authentication successful'
  };
};

export const generateNewTwoFactorCodeApi = async (sessionId: string): Promise<{ success: boolean; message: string }> => {
  await delay(500);

  const session = mockSessions.get(sessionId);
  if (!session) {
    const error = new Error('Invalid or expired session') as any;
    error.status = 401;
    error.code = 'INVALID_SESSION';
    throw error;
  }

  // Update session timestamp
  mockSessions.set(sessionId, { ...session, timestamp: Date.now() });

  return {
    success: true,
    message: 'New verification code sent to your authenticator app'
  };
};
