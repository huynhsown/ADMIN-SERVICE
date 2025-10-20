import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const Title = styled.h1`
  color: #333;
  font-size: 1.5rem;
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CurrentTime = styled.span`
  font-weight: 500;
  color: #666;
`;

const LogoutButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #6c757d;
  color: white;

  &:hover {
    background: #5a6268;
    transform: translateY(-2px);
  }
`;

const Header: React.FC = () => {
  const { logout, user } = useAuth();
  const [currentTime, setCurrentTime] = React.useState(new Date().toLocaleString('vi-VN'));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('vi-VN'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <HeaderContainer>
      <Title>
        <i className="fas fa-chart-line" style={{ marginRight: '0.5rem' }}></i>
        SME Admin Dashboard
      </Title>
      <HeaderRight>
        <CurrentTime>{currentTime}</CurrentTime>
        <LogoutButton onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </LogoutButton>
      </HeaderRight>
    </HeaderContainer>
  );
};

export default Header;
