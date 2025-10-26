import React from 'react';
import styled from 'styled-components';
import { Notification, Pagination } from '../../types';

// Helper function to get icon for event type
const getEventTypeIcon = (eventType: string) => {
  switch (eventType) {
    case 'post.liked':
      return 'fas fa-heart';
    case 'post.commented':
      return 'fas fa-comment';
    case 'user.followed':
      return 'fas fa-user-plus';
    case 'post.shared':
      return 'fas fa-share';
    case 'post.mentioned':
      return 'fas fa-at';
    case 'post.created':
      return 'fas fa-plus-circle';
    case 'post.reacted':
      return 'fas fa-thumbs-up';
    case 'post.reaction.changed':
      return 'fas fa-exchange-alt';
    case 'system':
      return 'fas fa-cog';
    default:
      return 'fas fa-bell';
  }
};

// Helper function to get color for event type
const getEventTypeColor = (eventType: string) => {
  switch (eventType) {
    case 'post.liked':
      return '#dc3545'; // red
    case 'post.commented':
      return '#007bff'; // blue
    case 'user.followed':
      return '#28a745'; // green
    case 'post.shared':
      return '#6f42c1'; // purple
    case 'post.mentioned':
      return '#fd7e14'; // orange
    case 'post.created':
      return '#17a2b8'; // cyan
    case 'post.reacted':
      return '#ffc107'; // yellow
    case 'post.reaction.changed':
      return '#e83e8c'; // pink
    case 'system':
      return '#6c757d'; // gray
    default:
      return '#6c757d'; // gray
  }
};

const TableContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;

  h3 {
    margin: 0;
    color: #333;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  th {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
  }
`;

const TableBody = styled.tbody`
  tr:hover {
    background: #f8f9fa;
  }

  td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #dee2e6;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
`;

const PaginationInfo = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  span {
    font-weight: 500;
    color: #333;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;

  &.secondary {
    background: #6c757d;
    color: white;

    &:hover:not(:disabled) {
      background: #5a6268;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const StatusBadge = styled.span<{ $status: 'read' | 'unread' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => props.$status === 'read' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$status === 'read' ? '#155724' : '#721c24'};
`;

const ActionButton = styled.button<{ $type: 'view' | 'delete' | 'read' | 'unread' }>`
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin: 0 0.25rem;
  transition: all 0.3s;

  &.view {
    background: #007bff;
    color: white;
  }

  &.delete {
    background: #dc3545;
    color: white;
  }

  &.read {
    background: #28a745;
    color: white;
  }

  &.unread {
    background: #ffc107;
    color: #212529;
  }

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface NotificationTableProps {
  notifications: Notification[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onViewNotification: (notificationId: string) => void;
  onDeleteNotification: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string, readFlag: boolean) => void;
  loading: boolean;
}

const NotificationTable: React.FC<NotificationTableProps> = ({
  notifications,
  pagination,
  onPageChange,
  onViewNotification,
  onDeleteNotification,
  onMarkAsRead,
  loading,
}) => {
  const { page, limit, total, totalPages } = pagination;

  if (loading && notifications.length === 0) {
    return (
      <TableContainer>
        <LoadingSpinner>
          <div className="spinner"></div>
        </LoadingSpinner>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <TableHeader>
        <h3>Danh sách thông báo</h3>
      </TableHeader>

      <TableWrapper>
        <Table>
          <TableHead>
            <tr>
              <th>ID</th>
              <th>Người nhận</th>
              <th>Người gửi</th>
              <th>Loại sự kiện</th>
              <th>Tin nhắn</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </TableHead>
          <TableBody>
            {notifications.map((notification) => (
              <tr key={notification.notification_id}>
                <td title={notification.notification_id}>
                  {notification.notification_id.substring(0, 8)}...
                </td>
                <td>
                  {notification.toUser ? (
                    <div>
                      <strong>{notification.toUser.username}</strong><br />
                      <small>{notification.toUser.firstName} {notification.toUser.lastName}</small>
                    </div>
                  ) : (
                    'Unknown'
                  )}
                </td>
                <td>
                  {notification.fromUser ? (
                    <div>
                      <strong>{notification.fromUser.username}</strong><br />
                      <small>{notification.fromUser.firstName} {notification.fromUser.lastName}</small>
                    </div>
                  ) : (
                    'System'
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i 
                      className={getEventTypeIcon(notification.event_type)} 
                      style={{ color: getEventTypeColor(notification.event_type) }}
                    ></i>
                    <span>{notification.event_type || 'Unknown'}</span>
                  </div>
                </td>
                <td>
                  <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {notification.message ? notification.message.substring(0, 100) + '...' : 'No message'}
                  </div>
                </td>
                <td>{new Date(notification.created_at).toLocaleString('vi-VN')}</td>
                <td>
                  <StatusBadge $status={notification.read_flag ? 'read' : 'unread'}>
                    {notification.read_flag ? 'Đã đọc' : 'Chưa đọc'}
                  </StatusBadge>
                </td>
                <td>
                  <ActionButton
                    $type="view"
                    className="view"
                    onClick={() => onViewNotification(notification.notification_id)}
                    title="Xem chi tiết"
                  >
                    <i className="fas fa-eye"></i>
                  </ActionButton>
                  <ActionButton
                    $type="delete"
                    className="delete"
                    onClick={() => onDeleteNotification(notification.notification_id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </ActionButton>
                  {notification.read_flag ? (
                    <ActionButton
                      $type="unread"
                      className="unread"
                      onClick={() => onMarkAsRead(notification.notification_id, false)}
                      title="Đánh dấu chưa đọc"
                    >
                      <i className="fas fa-envelope"></i>
                    </ActionButton>
                  ) : (
                    <ActionButton
                      $type="read"
                      className="read"
                      onClick={() => onMarkAsRead(notification.notification_id, true)}
                      title="Đánh dấu đã đọc"
                    >
                      <i className="fas fa-envelope-open"></i>
                    </ActionButton>
                  )}
                </td>
              </tr>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>

      <PaginationContainer>
        <PaginationInfo>
          Hiển thị {(page - 1) * limit + 1}-{Math.min(page * limit, total)} của {total}
        </PaginationInfo>
        <PaginationControls>
          <Button
            className="secondary"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <i className="fas fa-chevron-left"></i> Trước
          </Button>
          <span>{page}</span>
          <Button
            className="secondary"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Sau <i className="fas fa-chevron-right"></i>
          </Button>
        </PaginationControls>
      </PaginationContainer>
    </TableContainer>
  );
};

export default NotificationTable;
