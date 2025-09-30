'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { LoginForm } from './LoginForm';
import { TwoFactorForm } from './TwoFactorForm';
import { useAuth } from '../../contexts/AuthContext';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8fafc;
`;

const AuthContainer = styled.div`
  width: 100%;
  max-width: 480px;
`;

type AuthStep = 'login' | 'twoFactor';

interface AuthState {
  step: AuthStep;
  sessionId?: string;
  email?: string;
}

export const AuthPage: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    step: 'login',
  });
  const { login } = useAuth();

  const handleLoginSuccess = (data: {
    requiresTwoFactor: boolean;
    sessionId?: string;
    email: string;
  }) => {
    if (data.requiresTwoFactor && data.sessionId) {
      setAuthState({
        step: 'twoFactor',
        sessionId: data.sessionId,
        email: data.email,
      });
    } else {
      // Direct login for users without 2FA
      // In a real app, you'd get a token from the login response
      const mockToken = `token_${Date.now()}`;
      login(mockToken, data.email);
    }
  };

  const handleTwoFactorSuccess = (token: string, email: string) => {
    login(token, email);
  };

  const handleBackToLogin = () => {
    setAuthState({
      step: 'login',
    });
  };

  return (
    <PageContainer>
      <AuthContainer>
        {authState.step === 'login' && (
          <LoginForm onSuccess={handleLoginSuccess} />
        )}
        
        {authState.step === 'twoFactor' && authState.sessionId && authState.email && (
          <TwoFactorForm
            sessionId={authState.sessionId}
            email={authState.email}
            onSuccess={handleTwoFactorSuccess}
            onBack={handleBackToLogin}
          />
        )}
      </AuthContainer>
    </PageContainer>
  );
};
