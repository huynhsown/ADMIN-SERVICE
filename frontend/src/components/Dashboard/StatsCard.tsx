import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Icon = styled.div<{ $type: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  background: ${props => {
    switch (props.$type) {
      case 'users':
        return 'linear-gradient(45deg, #667eea, #764ba2)';
      case 'posts':
        return 'linear-gradient(45deg, #f093fb, #f5576c)';
      case 'comments':
        return 'linear-gradient(45deg, #4facfe, #00f2fe)';
      case 'reactions':
        return 'linear-gradient(45deg, #43e97b, #38f9d7)';
      default:
        return 'linear-gradient(45deg, #667eea, #764ba2)';
    }
  }};
`;

const Content = styled.div`
  flex: 1;
`;

const Value = styled.h3`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
`;

const Label = styled.p`
  color: #666;
  margin-bottom: 0.5rem;
`;

const SubLabel = styled.small`
  color: #999;
  font-size: 0.9rem;
`;

interface StatsCardProps {
  type: 'users' | 'posts' | 'comments' | 'reactions';
  value: number;
  label: string;
  subLabel?: string;
  icon: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ type, value, label, subLabel, icon }) => {
  return (
    <Card>
      <Icon $type={type}>
        <i className={icon}></i>
      </Icon>
      <Content>
        <Value>{value.toLocaleString()}</Value>
        <Label>{label}</Label>
        {subLabel && <SubLabel>{subLabel}</SubLabel>}
      </Content>
    </Card>
  );
};

export default StatsCard;
