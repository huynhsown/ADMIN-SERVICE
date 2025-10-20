import React from 'react';
import styled from 'styled-components';

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  white-space: nowrap;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-weight: 600;
  font-size: 0.8rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  
  &.active {
    background: #d4edda;
    color: #155724;
  }
  
  &.inactive {
    background: #f8d7da;
    color: #721c24;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
`;

const PaginationInfo = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #adb5bd;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UserTableProps {
  users: User[];
  pagination: Pagination;
  onUserSelect: (user: User) => void;
  onPageChange: (page: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  pagination,
  onUserSelect,
  onPageChange
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const { page, totalPages } = pagination;
    
    // Previous button
    buttons.push(
      <PaginationButton
        key="prev"
        onClick={() => onPageChange(page - 1)}
        disabled={!pagination.hasPrev}
      >
        Trước
      </PaginationButton>
    );

    // Page numbers
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationButton
          key={i}
          onClick={() => onPageChange(i)}
          className={i === page ? 'active' : ''}
        >
          {i}
        </PaginationButton>
      );
    }

    // Next button
    buttons.push(
      <PaginationButton
        key="next"
        onClick={() => onPageChange(page + 1)}
        disabled={!pagination.hasNext}
      >
        Sau
      </PaginationButton>
    );

    return buttons;
  };

  if (users.length === 0) {
    return (
      <EmptyState>
        <h3>Không tìm thấy người dùng nào</h3>
        <p>Thử thay đổi bộ lọc để tìm kiếm người dùng khác</p>
      </EmptyState>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <tr>
            <TableHeaderCell>Người dùng</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Số điện thoại</TableHeaderCell>
            <TableHeaderCell>Ngày tạo</TableHeaderCell>
            <TableHeaderCell>Trạng thái</TableHeaderCell>
          </tr>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId} onClick={() => onUserSelect(user)}>
              <TableCell>
                <UserInfo>
                  {user.avtUrl ? (
                    <Avatar src={user.avtUrl} alt={`${user.firstName} ${user.lastName}`} />
                  ) : (
                    <AvatarPlaceholder>
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarPlaceholder>
                  )}
                  <UserDetails>
                    <UserName>{user.firstName} {user.lastName}</UserName>
                    <UserEmail>@{user.username}</UserEmail>
                  </UserDetails>
                </UserInfo>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone || 'Chưa cập nhật'}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <StatusBadge className="active">
                  Hoạt động
                </StatusBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <PaginationContainer>
        <PaginationInfo>
          Hiển thị {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} người dùng
        </PaginationInfo>
        <PaginationButtons>
          {renderPaginationButtons()}
        </PaginationButtons>
      </PaginationContainer>
    </TableContainer>
  );
};

export default UserTable;
