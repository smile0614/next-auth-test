'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import styled from 'styled-components';
import Image from 'next/image';
import { loginApi, LoginRequest } from '../../lib/api';
import { loginSchema, LoginFormData } from '../../schemas/authSchemas';

const FormContainer = styled.div`
  width: 440px;
  background: white;
  border-radius: 12px;
  padding: 48px 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
  text-align: center;
  
  @media (max-width: 480px) {
    width: calc(100vw - 32px);
    padding: 32px 24px;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
`;

const LogoIcon = styled.div`
  width: 24px;
  height: 24px;
  background: #1677FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::after {
    content: '';
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
  }
`;

const CompanyLogo = styled(Image)`
  height: auto;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 24px 0;
  font-style: normal;
  line-height: 32px;
  letter-spacing: 0px;
  text-align: center;
  vertical-align: middle;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  position: relative;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  color: #9ca3af;
  z-index: 1;
  display: flex;
  align-items: center;
  height: 100%;
`;

const Input = styled.input<{ $hasError?: boolean; $hasIcon?: boolean }>`
  width: 100%;
  height: 40px;
  padding: 0 16px;
  padding-left: ${props => props.$hasIcon ? '40px' : '16px'};
  border: 1px solid ${({ $hasError }) => $hasError ? '#ef4444' : '#d1d5db'};
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #374151;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => $hasError ? '#ef4444' : '#1677FF'};
    box-shadow: 0 0 0 3px ${({ $hasError }) => 
      $hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(37, 99, 235, 0.1)'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  text-align: left;
`;

const LoginButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  height: 40px;
  background: ${props => props.$loading ? '#93c5fd' : '#1677FF'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  
  &:hover:not(:disabled) {
    background: ${props => props.$loading ? '#93c5fd' : '#1d4ed8'};
  }
  
  &:disabled {
    background: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorAlert = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  text-align: left;
`;

const TestCredentialsInfo = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0284c7;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 12px;
  text-align: left;
  
  h4 {
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 13px;
  }
  
  ul {
    margin: 0;
    padding-left: 16px;
  }
  
  li {
    margin-bottom: 4px;
    line-height: 1.4;
  }
`;

const TestToggleButton = styled.button`
  background: none;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #1677FF;
    color: #1677FF;
  }
`;

interface LoginFormProps {
  onSuccess: (data: { requiresTwoFactor: boolean; sessionId?: string; email: string }) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [showTestInfo, setShowTestInfo] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // Enable real-time validation
  });

  // Watch form values to trigger re-renders on input changes
  const watchedValues = watch();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (response) => {
      onSuccess({
        requiresTwoFactor: response.requiresTwoFactor || false,
        sessionId: response.sessionId,
        email: getValues('email'),
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const getErrorMessage = (error: any) => {
    if (error?.code) {
      switch (error.code) {
        case 'INVALID_CREDENTIALS':
          return 'Invalid email or password. Please check your credentials and try again.';
        case 'USER_NOT_FOUND':
          return 'No account found with this email address.';
        case 'ACCOUNT_LOCKED':
          return 'Your account has been locked due to too many failed login attempts. Please contact support.';
        case 'ACCOUNT_SUSPENDED':
          return 'Your account has been suspended. Please contact support for assistance.';
        case 'PASSWORD_EXPIRED':
          return 'Your password has expired. Please reset your password to continue.';
        case 'RATE_LIMIT_EXCEEDED':
          return 'Too many login attempts. Please wait a few minutes before trying again.';
        case 'SERVICE_UNAVAILABLE':
          return 'The service is temporarily unavailable for maintenance. Please try again later.';
        case 'INVALID_EMAIL':
          return 'Please enter a valid email address.';
        default:
          return error.message || 'An unexpected error occurred. Please try again.';
      }
    }
    
    if (error?.message?.includes('Network request failed')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    
    if (error?.message?.includes('timeout')) {
      return 'The request timed out. Please check your connection and try again.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  return (
    <FormContainer>
      <LogoContainer>
        <LogoIcon />
        <CompanyLogo 
          src="/Company.svg" 
          alt="Company" 
          width={67} 
          height={13}
        />
      </LogoContainer>
      
      <Title>Sign in to your account to continue</Title>
      
      {showTestInfo ? (
        <TestCredentialsInfo>
          <h4>Test Credentials & Error Scenarios:</h4>
          <ul>
            <li><strong>Valid:</strong> user@example.com / password123 (2FA required)</li>
            <li><strong>Valid:</strong> admin@example.com / admin123 (no 2FA)</li>
            <li><strong>Network Error:</strong> network@error.com</li>
            <li><strong>Server Error:</strong> server@error.com</li>
            <li><strong>Account Locked:</strong> locked@account.com</li>
            <li><strong>Rate Limited:</strong> ratelimit@test.com</li>
          </ul>
          <TestToggleButton onClick={() => setShowTestInfo(false)}>
            Hide Test Info
          </TestToggleButton>
        </TestCredentialsInfo>
      ) : (
        <TestToggleButton onClick={() => setShowTestInfo(true)}>
          Show Test Credentials
        </TestToggleButton>
      )}

      {loginMutation.error && (
        <ErrorAlert>
          {getErrorMessage(loginMutation.error)}
        </ErrorAlert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup>
          <InputContainer>
            <InputIcon>
              <Image 
                src="/auth/user.svg" 
                alt="User" 
                width={12} 
                height={14}
              />
            </InputIcon>
            <Input
              {...register('email')}
              type="email"
              placeholder="Email"
              $hasError={!!errors.email}
              $hasIcon={true}
              disabled={loginMutation.isPending}
            />
          </InputContainer>
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <InputContainer>
            <InputIcon>
              <Image 
                src="/auth/lock.svg" 
                alt="Lock" 
                width={12} 
                height={14}
              />
            </InputIcon>
            <Input
              {...register('password')}
              type="password"
              placeholder="Password"
              $hasError={!!errors.password}
              $hasIcon={true}
              disabled={loginMutation.isPending}
            />
          </InputContainer>
          {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
        </FormGroup>

        <LoginButton
          type="submit"
          $loading={loginMutation.isPending}
          disabled={loginMutation.isPending || !isValid}
        >
          {loginMutation.isPending ? (
            <>
              <LoadingSpinner />
              Signing in...
            </>
          ) : (
            'Log in'
          )}
        </LoginButton>
      </form>
    </FormContainer>
  );
};
