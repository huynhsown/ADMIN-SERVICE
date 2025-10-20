import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.nav`
  position: fixed;
  left: 0;
  top: 80px;
  width: 250px;
  height: calc(100vh - 80px);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem 0;
  overflow-y: auto;
  z-index: 99;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled.button<{ $active: boolean }>`
  display: block;
  width: 100%;
  padding: 1rem 2rem;
  color: ${props => props.$active ? '#667eea' : '#666'};
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid ${props => props.$active ? '#667eea' : 'transparent'};
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 1rem;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }
`;

const Icon = styled.i`
  margin-right: 0.5rem;
  width: 20px;
  text-align: center;
`;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Tổng quan', icon: 'fas fa-tachometer-alt' },
    { path: '/users', label: 'Người dùng', icon: 'fas fa-users' },
    { path: '/posts', label: 'Bài viết', icon: 'fas fa-file-alt' },
    { path: '/comments', label: 'Bình luận', icon: 'fas fa-comments' },
    { path: '/reactions', label: 'Tương tác', icon: 'fas fa-heart' },
    { path: '/notifications', label: 'Thông báo', icon: 'fas fa-bell' },
    { path: '/health', label: 'Hệ thống', icon: 'fas fa-heartbeat' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <SidebarContainer>
      <NavList>
        {menuItems.map((item) => (
          <NavItem key={item.path}>
            <NavLink
              $active={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <Icon className={item.icon}></Icon>
              {item.label}
            </NavLink>
          </NavItem>
        ))}
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;
