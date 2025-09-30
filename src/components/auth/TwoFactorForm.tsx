'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import styled from 'styled-components';
import Image from 'next/image';
import { verifyTwoFactorApi, generateNewTwoFactorCodeApi, TwoFactorRequest } from '../../lib/api';
import { twoFactorSchema, TwoFactorFormData } from '../../schemas/authSchemas';
import { useAuth } from '../../contexts/AuthContext';

const FormContainer = styled.div`
  width: 440px;
  background: white;
  border-radius: 12px;
  padding: 48px 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin: 0 auto;
  text-align: center;
  position: relative;
  
  @media (max-width: 480px) {
    width: calc(100vw - 32px);
    padding: 32px 24px;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f3f4f6;
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
  margin: 0 0 0px 0;
  font-style: normal;
  line-height: 32px;
  letter-spacing: 0px;
  text-align: center;
  vertical-align: middle;
`;

const Subtitle = styled.p`
  font-weight: 400;
  font-style: normal;
  font-size: 16px;
  line-height: 28px;
  letter-spacing: 0px;
  text-align: center;
  vertical-align: middle;
  color: #374151;
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 8px;
`;

const CodeInput = styled.input<{ $hasError?: boolean }>`
  max-width: 52px;
  width: 100%;
  height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  border: 1px solid ${({ $hasError }) => $hasError ? '#ef4444' : '#d1d5db'};
  border-radius: 8px;
  background: white;
  color: #374151;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ $hasError }) => $hasError ? '#ef4444' : '#1677FF'};
    box-shadow: 0 0 0 3px ${({ $hasError }) => 
      $hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(22, 119, 255, 0.1)'};
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'outline'; $loading?: boolean }>`
  width: 100%;
  height: 40px;
  background: ${props => {
    if (props.$loading) return '#93c5fd';
    return props.$variant === 'outline' ? 'white' : '#1677FF';
  }};
  color: ${props => props.$variant === 'outline' ? '#1677FF' : 'white'};
  border: ${props => props.$variant === 'outline' ? '1px solid #1677FF' : 'none'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  
  &:hover {
    background: ${props => {
      if (props.$loading) return '#93c5fd';
      if (props.$variant === 'outline') return '#f8fafc';
      return '#0d5bdd';
    }};
  }
  
  &:disabled {
    background: ${props => props.$variant === 'outline' ? '#f9fafb' : '#93c5fd'};
    color: ${props => props.$variant === 'outline' ? '#9ca3af' : 'white'};
    border-color: ${props => props.$variant === 'outline' ? '#e5e7eb' : 'none'};
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

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
  margin-bottom: 24px;
  text-align: left;
`;

const ButtonContainer = styled.div`
  margin-top: 24px;
`;

const ErrorAlert = styled.div`
  color: #dc2626;
  border-radius: 8px;
  font-size: 14px;
  text-align: left;
`;

const SuccessAlert = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  text-align: left;
`;

const TestCodesInfo = styled.div`
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
  margin-top: 16px;
  margin-bottom: 16px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #1677FF;
    color: #1677FF;
  }
`;

interface TwoFactorFormProps {
  sessionId: string;
  email: string;
  onSuccess: (token: string, email: string) => void;
  onBack: () => void;
}

export const TwoFactorForm: React.FC<TwoFactorFormProps> = ({
  sessionId,
  email,
  onSuccess,
  onBack,
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [showTestInfo, setShowTestInfo] = useState(false);
  const [newCodeMessage, setNewCodeMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { login } = useAuth();

  const {
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
  });

  const verifyMutation = useMutation({
    mutationFn: (data: TwoFactorRequest) => verifyTwoFactorApi(data),
    onSuccess: (response) => {
      if (response.token) {
        login(response.token, email);
        onSuccess(response.token, email);
      }
    },
  });

  const newCodeMutation = useMutation({
    mutationFn: () => generateNewTwoFactorCodeApi(sessionId),
    onSuccess: (response) => {
      setNewCodeMessage(response.message);
      setTimeout(() => setNewCodeMessage(''), 5000);
    },
  });

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start countdown timer
    startResendTimer();

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startResendTimer = () => {
    setResendTimer(60);
    setCanResend(false);
    
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take the last digit
    setCode(newCode);
    clearErrors();

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && value) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 6) {
      const newCode = digits.split('');
      setCode(newCode);
      clearErrors();
      inputRefs.current[5]?.focus();
      handleSubmit(digits);
    }
  };

  const handleSubmit = (codeValue: string) => {
    const codeString = codeValue || code.join('');
    
    if (codeString.length !== 6) {
      setError('code', { message: 'Please enter all 6 digits' });
      return;
    }

    verifyMutation.mutate({
      sessionId,
      code: codeString,
    });
  };

  const handleGetNewCode = () => {
    if (canResend && !newCodeMutation.isPending) {
      newCodeMutation.mutate();
      startResendTimer(); // Restart timer after sending new code
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getErrorMessage = (error: any) => {
    if (error?.code) {
      switch (error.code) {
        case 'INVALID_2FA_CODE':
          return 'Invalid code.';
        case 'SESSION_EXPIRED':
          return 'Your session has expired. Please login again.';
        case 'INVALID_SESSION':
          return 'Invalid session. Please login again.';
        case 'TOO_MANY_ATTEMPTS':
          return 'Too many invalid attempts. Your account has been temporarily locked.';
        default:
          return error.message || 'An unexpected error occurred. Please try again.';
      }
    }
    
    return 'An unexpected error occurred. Please try again.';
  };

  return (
    <FormContainer>
      <BackButton onClick={onBack}>
        <Image 
          src="/auth/left-arrow.svg" 
          alt="Back" 
          width={14} 
          height={14}
        />
      </BackButton>
      
      <LogoContainer>
        <LogoIcon />
        <CompanyLogo 
          src="/Company.svg" 
          alt="Company" 
          width={67} 
          height={13}
        />
      </LogoContainer>
      
      <Title>Two-Factor Authentication</Title>
      <Subtitle>
        Enter the 6-digit code from the Google<br />
        Authenticator app
      </Subtitle>

      {showTestInfo ? (
        <TestCodesInfo>
          <h4>Test Codes & Error Scenarios:</h4>
          <ul>
            <li><strong>Valid:</strong> 123456 or 131311</li>
            <li><strong>Invalid Code:</strong> 111111</li>
            <li><strong>Too Many Attempts:</strong> 000000</li>
            <li><strong>Invalid Session:</strong> Use session ID "invalid_session_12345"</li>
            <li><strong>Expired Session:</strong> Use session ID "expired_session_12345"</li>
          </ul>
          <TestToggleButton onClick={() => setShowTestInfo(false)}>
            Hide Test Info
          </TestToggleButton>
        </TestCodesInfo>
      ) : (
        <TestToggleButton onClick={() => setShowTestInfo(true)}>
          Show Test Codes
        </TestToggleButton>
      )}

      {newCodeMessage && (
        <SuccessAlert>
          {newCodeMessage}
        </SuccessAlert>
      )}

      <CodeInputContainer>
        {code.map((digit, index) => (
          <CodeInput
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            $hasError={!!errors.code || !!verifyMutation.error}
            disabled={verifyMutation.isPending}
            maxLength={1}
          />
        ))}
      </CodeInputContainer>

      {verifyMutation.error && (
        <ErrorAlert>
          {getErrorMessage(verifyMutation.error)}
        </ErrorAlert>
      )}

      {newCodeMutation.error && (
        <ErrorAlert>
          {getErrorMessage(newCodeMutation.error)}
        </ErrorAlert>
      )}

      {/* {errors.code && (
        <ErrorMessage>{errors.code.message}</ErrorMessage>
      )} */}

      <ButtonContainer>
        <ActionButton
          onClick={() => handleSubmit('')}
          disabled={verifyMutation.isPending || code.some(digit => !digit)}
          $loading={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? (
            <>
              <LoadingSpinner />
              Verifying...
            </>
          ) : (
            'Continue'
          )}
        </ActionButton>

        <ActionButton
          $variant="outline"
          onClick={handleGetNewCode}
          disabled={!canResend || newCodeMutation.isPending}
          $loading={newCodeMutation.isPending}
        >
          {newCodeMutation.isPending ? (
            <>
              <LoadingSpinner />
              Getting new code...
            </>
          ) : canResend ? (
            'Get new'
          ) : (
            formatTime(resendTimer)
          )}
        </ActionButton>
      </ButtonContainer>
    </FormContainer>
  );
};
