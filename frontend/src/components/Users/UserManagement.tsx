import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../../services/api';
import UserFilters from './UserFilters';
import UserStats from './UserStats';
import UserDetailsModal from './UserDetailsModal';
import UserTable from './UserTable';

const Container = styled.div`
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.primary {
    background: #3498db;
    color: white;
    
    &:hover {
      background: #2980b9;
    }
  }

  &.secondary {
    background: #95a5a6;
    color: white;
    
    &:hover {
      background: #7f8c8d;
    }
  }

  &.success {
    background: #27ae60;
    color: white;
    
    &:hover {
      background: #229954;
    }
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
`;

const MainContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

interface User {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avtUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFiltersState {
  search: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  pageSize?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState<UserFiltersState>({
    search: '',
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await apiService.get(`/users?${params.toString()}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newFilters: Partial<UserFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ 
      ...prev, 
      page: 1,
      limit: newFilters.pageSize ? parseInt(newFilters.pageSize) : prev.limit
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleExportUsers = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await apiService.get(`/users/export/csv?${params.toString()}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi xuất dữ liệu');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page, pagination.limit]);

  return (
    <Container>
      <Header>
        <Title>Quản lý Người dùng</Title>
        <ActionButtons>
          <Button className="secondary" onClick={() => fetchUsers()}>
            Làm mới
          </Button>
          <Button className="success" onClick={handleExportUsers}>
            Xuất CSV
          </Button>
        </ActionButtons>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Content>
        <MainContent>
          <UserFilters 
            filters={filters}
            onFiltersChange={handleSearch}
          />
          
          {loading ? (
            <LoadingSpinner>
              <div className="spinner"></div>
            </LoadingSpinner>
          ) : (
            <UserTable
              users={users}
              pagination={pagination}
              onUserSelect={handleUserSelect}
              onPageChange={handlePageChange}
            />
          )}
        </MainContent>

        <Sidebar>
          <UserStats />
        </Sidebar>
      </Content>

      {showUserDetails && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserDetails(false);
            setSelectedUser(null);
          }}
        />
      )}
    </Container>
  );
};

export default UserManagement;
