import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../../services/api';
import RoleManagement from './RoleManagement';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-weight: 600;
  font-size: 1.5rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.25rem;
`;

const UserUsername = styled.p`
  margin: 0 0 0.25rem 0;
  color: #6c757d;
  font-size: 1rem;
`;

const UserEmail = styled.p`
  margin: 0;
  color: #495057;
  font-size: 0.9rem;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DetailItem = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
`;

const DetailLabel = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.div`
  color: #2c3e50;
  font-weight: 500;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  
  &.active {
    background: #d4edda;
    color: #155724;
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }

  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  }
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

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<{ active: boolean; enabled: boolean } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserRoles();
    fetchUserStatus();
  }, [user.userId]);

  const fetchUserRoles = async () => {
    try {
      setLoadingRoles(true);
      setError(null);
      const response = await apiService.get(`/roles/user/${user.userId}`);
      setUserRoles(response.data.roles || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi tải roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchUserStatus = async () => {
    try {
      setLoadingStatus(true);
      setStatusError(null);
      const response = await apiService.get(`/roles/user/${user.userId}/status`);
      setUserStatus(response.data);
    } catch (err: any) {
      setStatusError(err.response?.data?.error || 'Lỗi khi tải trạng thái user');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleActivateUser = async () => {
    try {
      await apiService.post(`/roles/user/${user.userId}/activate`);
      await fetchUserStatus(); // Refresh status
    } catch (err: any) {
      setStatusError(err.response?.data?.error || 'Lỗi khi kích hoạt user');
    }
  };

  const handleDeactivateUser = async () => {
    try {
      await apiService.post(`/roles/user/${user.userId}/deactivate`);
      await fetchUserStatus(); // Refresh status
    } catch (err: any) {
      setStatusError(err.response?.data?.error || 'Lỗi khi vô hiệu hóa user');
    }
  };

  const handleRolesChange = (newRoles: string[]) => {
    setUserRoles(newRoles);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Chi tiết Người dùng</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          <UserProfile>
            {user.avtUrl ? (
              <Avatar src={user.avtUrl} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <AvatarPlaceholder>
                {getInitials(user.firstName, user.lastName)}
              </AvatarPlaceholder>
            )}
            <UserInfo>
              <UserName>{user.firstName} {user.lastName}</UserName>
              <UserUsername>@{user.username}</UserUsername>
              <UserEmail>{user.email}</UserEmail>
            </UserInfo>
          </UserProfile>

          <DetailsGrid>
            <DetailItem>
              <DetailLabel>ID Người dùng</DetailLabel>
              <DetailValue>{user.userId}</DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Trạng thái</DetailLabel>
              <DetailValue>
                {loadingStatus ? (
                  <span>Đang tải...</span>
                ) : statusError ? (
                  <span style={{ color: '#e74c3c' }}>Lỗi: {statusError}</span>
                ) : userStatus ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <StatusBadge className={userStatus.active ? 'active' : 'inactive'}>
                      {userStatus.active ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </StatusBadge>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!userStatus.active && (
                        <Button 
                          className="success" 
                          onClick={handleActivateUser}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          Kích hoạt
                        </Button>
                      )}
                      {userStatus.active && (
                        <Button 
                          className="secondary" 
                          onClick={handleDeactivateUser}
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          Vô hiệu hóa
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <span>Không có thông tin</span>
                )}
              </DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Số điện thoại</DetailLabel>
              <DetailValue>{user.phone || 'Chưa cập nhật'}</DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Email</DetailLabel>
              <DetailValue>{user.email}</DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Ngày tạo</DetailLabel>
              <DetailValue>{formatDate(user.createdAt)}</DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Cập nhật lần cuối</DetailLabel>
              <DetailValue>{formatDate(user.updatedAt)}</DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>Roles</DetailLabel>
              <DetailValue>
                {loadingRoles ? (
                  <span>Đang tải...</span>
                ) : error ? (
                  <span style={{ color: '#e74c3c' }}>Lỗi: {error}</span>
                ) : userRoles.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {userRoles.map((role, index) => (
                      <StatusBadge key={index} className="active">
                        {role}
                      </StatusBadge>
                    ))}
                  </div>
                ) : (
                  <span>Không có roles</span>
                )}
              </DetailValue>
            </DetailItem>
          </DetailsGrid>

          <RoleManagement
            userId={user.userId}
            currentRoles={userRoles}
            onRolesChange={handleRolesChange}
          />
        </ModalBody>

        <ModalFooter>
          <Button className="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button className="primary" onClick={() => {
            // TODO: Implement user actions
            console.log('User actions not implemented yet');
          }}>
            Thực hiện hành động
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UserDetailsModal;
