'use client';

import styled from 'styled-components';

// Container component
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0 ${({ theme }) => theme.spacing.lg};
  }
`;

// Button component with variants
export const Button = styled.button<{ 
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: 1px solid transparent;
  
  /* Size variants */
  ${({ size = 'md', theme }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: ${theme.fontSizes.sm};
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: ${theme.fontSizes.lg};
        `;
      default:
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.fontSizes.base};
        `;
    }
  }}
  
  /* Color variants */
  ${({ variant = 'primary', theme }) => {
    switch (variant) {
      case 'secondary':
        return `
          background-color: ${theme.colors.secondary};
          color: ${theme.colors.background};
          
          &:hover {
            background-color: ${theme.colors.foreground};
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: ${theme.colors.primary};
          border-color: ${theme.colors.primary};
          
          &:hover {
            background-color: ${theme.colors.primary};
            color: ${theme.colors.background};
          }
        `;
      default:
        return `
          background-color: ${theme.colors.primary};
          color: ${theme.colors.background};
          
          &:hover {
            opacity: 0.9;
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Card component
export const Card = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: all 0.2s ease-in-out;
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px);
  }
  
  @media (prefers-color-scheme: dark) {
    background: ${({ theme }) => theme.colors.backgroundDark};
    border-color: ${({ theme }) => theme.colors.borderDark};
  }
`;

// Typography components
export const Title = styled.h1<{ size?: 'sm' | 'md' | 'lg' | 'xl' }>`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  font-weight: 600;
  line-height: 1.2;
  
  ${({ size = 'lg', theme }) => {
    switch (size) {
      case 'sm':
        return `font-size: ${theme.fontSizes.xl};`;
      case 'md':
        return `font-size: ${theme.fontSizes['2xl']};`;
      case 'lg':
        return `font-size: ${theme.fontSizes['3xl']};`;
      case 'xl':
        return `font-size: ${theme.fontSizes['4xl']};`;
      default:
        return `font-size: ${theme.fontSizes['3xl']};`;
    }
  }}
  
  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors.foregroundDark};
  }
`;

export const Text = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.foreground};
  line-height: 1.6;
  
  @media (prefers-color-scheme: dark) {
    color: ${({ theme }) => theme.colors.foregroundDark};
  }
`;

// Flex components
export const Flex = styled.div<{
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${({ direction = 'row' }) => direction};
  justify-content: ${({ justify = 'start' }) => {
    switch (justify) {
      case 'center': return 'center';
      case 'end': return 'flex-end';
      case 'between': return 'space-between';
      case 'around': return 'space-around';
      default: return 'flex-start';
    }
  }};
  align-items: ${({ align = 'start' }) => {
    switch (align) {
      case 'center': return 'center';
      case 'end': return 'flex-end';
      case 'stretch': return 'stretch';
      default: return 'flex-start';
    }
  }};
  gap: ${({ gap, theme }) => gap || theme.spacing.md};
  flex-wrap: ${({ wrap }) => wrap ? 'wrap' : 'nowrap'};
`;

// Grid component
export const Grid = styled.div<{
  columns?: number;
  gap?: string;
}>`
  display: grid;
  grid-template-columns: repeat(${({ columns = 1 }) => columns}, 1fr);
  gap: ${({ gap, theme }) => gap || theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;
