import React from 'react';
import styled from 'styled-components';
import { Notification } from '../../types';

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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 800px;
  max-height: 90%;
  overflow: hidden;
`;

const ModalHeader = styled.div`
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

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e9ecef;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const NotificationDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const NotificationInfo = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;

  h4 {
    margin-bottom: 1rem;
    color: #333;
  }
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #666;
`;

const InfoValue = styled.span`
  color: #333;
`;

const NotificationContent = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;

  h4 {
    margin-bottom: 1rem;
    color: #333;
  }
`;

const MessageText = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled.button`
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

  &.primary {
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
  }

  &.success {
    background: #28a745;
    color: white;

    &:hover {
      background: #218838;
      transform: translateY(-2px);
    }
  }

  &.warning {
    background: #ffc107;
    color: #212529;

    &:hover {
      background: #e0a800;
      transform: translateY(-2px);
    }
  }

  &.danger {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
      transform: translateY(-2px);
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

interface NotificationDetailsModalProps {
  notification: Notification;
  onClose: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string, readFlag: boolean) => void;
}

const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  notification,
  onClose,
  onDeleteNotification,
  onMarkAsRead,
}) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>
            <i className="fas fa-bell" style={{ marginRight: '0.5rem' }}></i>
            Chi tiết thông báo
          </h3>
          <CloseButton onClick={onClose}>
            <i className="fas fa-times"></i>
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <NotificationDetails>
            <NotificationInfo>
              <h4>Thông tin thông báo</h4>
              <InfoItem>
                <InfoLabel>ID:</InfoLabel>
                <InfoValue>{notification.notification_id}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Người nhận:</InfoLabel>
                <InfoValue>
                  {notification.toUser ? (
                    <div>
                      <strong>{notification.toUser.username}</strong><br />
                      <small>{notification.toUser.firstName} {notification.toUser.lastName}</small>
                    </div>
                  ) : (
                    'Unknown'
                  )}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Người gửi:</InfoLabel>
                <InfoValue>
                  {notification.fromUser ? (
                    <div>
                      <strong>{notification.fromUser.username}</strong><br />
                      <small>{notification.fromUser.firstName} {notification.fromUser.lastName}</small>
                    </div>
                  ) : (
                    'System'
                  )}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Loại sự kiện:</InfoLabel>
                <InfoValue>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i 
                      className={getEventTypeIcon(notification.event_type)} 
                      style={{ color: getEventTypeColor(notification.event_type) }}
                    ></i>
                    <span>{notification.event_type || 'Unknown'}</span>
                  </div>
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Entity ID:</InfoLabel>
                <InfoValue>{notification.entity_id || 'N/A'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Ngày tạo:</InfoLabel>
                <InfoValue>{new Date(notification.created_at).toLocaleString('vi-VN')}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Trạng thái:</InfoLabel>
                <InfoValue>
                  <StatusBadge $status={notification.read_flag ? 'read' : 'unread'}>
                    {notification.read_flag ? 'Đã đọc' : 'Chưa đọc'}
                  </StatusBadge>
                </InfoValue>
              </InfoItem>
            </NotificationInfo>

            <NotificationContent>
              <h4>Nội dung</h4>
              <MessageText>{notification.message || 'Không có tin nhắn'}</MessageText>

              <NotificationActions>
                {notification.read_flag ? (
                  <Button
                    className="warning"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.notification_id, false);
                    }}
                  >
                    <i className="fas fa-envelope"></i> Đánh dấu chưa đọc
                  </Button>
                ) : (
                  <Button
                    className="success"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.notification_id, true);
                    }}
                  >
                    <i className="fas fa-envelope-open"></i> Đánh dấu đã đọc
                  </Button>
                )}
                <Button
                  className="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNotification(notification.notification_id);
                  }}
                >
                  <i className="fas fa-trash"></i> Xóa
                </Button>
              </NotificationActions>
            </NotificationContent>
          </NotificationDetails>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NotificationDetailsModal;
