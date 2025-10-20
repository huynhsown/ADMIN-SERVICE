import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../../services/api';

const RoleManagementContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
`;

const SectionTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoleList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  padding: 0;
  font-size: 0.8rem;
  margin-left: 0.25rem;
  
  &:hover {
    color: #b71c1c;
  }
`;

const AddRoleSection = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  min-width: 120px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;

  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }

  &.danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

interface Role {
  name: string;
  description: string;
}

interface RoleManagementProps {
  userId: string;
  currentRoles: string[];
  onRolesChange: (roles: string[]) => void;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  userId,
  currentRoles,
  onRolesChange
}) => {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  const fetchAvailableRoles = async () => {
    try {
      // Chỉ có 2 roles: ADMIN và USER
      setAvailableRoles([
        { name: 'ADMIN', description: 'Administrator' },
        { name: 'USER', description: 'Regular user' }
      ]);
    } catch (err: any) {
      setError('Lỗi khi tải danh sách roles');
    }
  };

  const handleAddRole = async () => {
    if (!selectedRole) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Gửi role về backend dưới dạng chữ thường
      const roleToSend = selectedRole.toLowerCase();

      await apiService.post('/roles/assign', {
        userId,
        role: roleToSend
      });

      // Update local state (hiển thị dạng chữ hoa)
      const newRoles = [...currentRoles, selectedRole];
      onRolesChange(newRoles);
      
      setSuccess(`Đã thêm role ${selectedRole} thành công`);
      setSelectedRole('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi thêm role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (roleToRemove: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Gửi role về backend dưới dạng chữ thường
      const roleToSend = roleToRemove.toLowerCase();

      await apiService.post('/roles/remove', {
        userId,
        role: roleToSend
      });

      // Update local state
      const newRoles = currentRoles.filter(role => role !== roleToRemove);
      onRolesChange(newRoles);
      
      setSuccess(`Đã xóa role ${roleToRemove} thành công`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi xóa role');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableRolesToAdd = () => {
    return availableRoles.filter(role => !currentRoles.includes(role.name));
  };

  return (
    <RoleManagementContainer>
      <SectionTitle>
        🛡️ Quản lý Roles
      </SectionTitle>

      <RoleList>
        {currentRoles.map((role, index) => (
          <RoleBadge key={index}>
            {role}
            <RemoveButton
              onClick={() => handleRemoveRole(role)}
              disabled={loading}
              title={`Xóa role ${role}`}
            >
              ×
            </RemoveButton>
          </RoleBadge>
        ))}
        {currentRoles.length === 0 && (
          <span style={{ color: '#6c757d', fontStyle: 'italic' }}>
            Chưa có roles nào
          </span>
        )}
      </RoleList>

      <AddRoleSection>
        <Select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          disabled={loading}
        >
          <option value="">Chọn role để thêm</option>
          {getAvailableRolesToAdd().map((role) => (
            <option key={role.name} value={role.name}>
              {role.name} - {role.description}
            </option>
          ))}
        </Select>

        <Button
          className="primary"
          onClick={handleAddRole}
          disabled={!selectedRole || loading}
        >
          {loading ? <LoadingSpinner /> : 'Thêm Role'}
        </Button>
      </AddRoleSection>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </RoleManagementContainer>
  );
};

export default RoleManagement;
