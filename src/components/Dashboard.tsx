'use client';

import React from 'react';
import styled from 'styled-components';
import { Container, Card, Title, Text, Button, Flex } from './StyledComponents';
import { useAuth } from '../contexts/AuthContext';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl} 0;
  
  @media (prefers-color-scheme: dark) {
    background: ${({ theme }) => theme.colors.backgroundDark};
  }
`;

const Header = styled.div`
  background: white;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} 0;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (prefers-color-scheme: dark) {
    background: ${({ theme }) => theme.colors.backgroundDark};
    border-color: ${({ theme }) => theme.colors.borderDark};
  }
`;

const WelcomeCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  h1, h2, p {
    color: white;
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const FeatureCard = styled(Card)`
  text-align: center;
  
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <DashboardContainer>
      <Header>
        <Container>
          <Flex justify="between" align="center">
            <Title size="md">Dashboard</Title>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </Flex>
        </Container>
      </Header>

      <Container>
        <WelcomeCard>
          <Title size="lg">Welcome back!</Title>
          <Text style={{ fontSize: '1.2rem', marginTop: '1rem' }}>
            You have successfully authenticated with your account: <strong>{user?.email}</strong>
          </Text>
          <Text style={{ marginTop: '0.5rem', opacity: 0.9 }}>
            Your authentication token: {user?.token?.substring(0, 20)}...
          </Text>
        </WelcomeCard>

      </Container>
    </DashboardContainer>
  );
};
