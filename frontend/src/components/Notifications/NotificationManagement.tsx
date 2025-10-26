import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../../services/api';
import { NotificationsResponse, Notification, NotificationFilters as NotificationFiltersType } from '../../types';
import NotificationTable from './NotificationTable';
import NotificationDetailsModal from './NotificationDetailsModal';

const Container = styled.div`
  h2 {
    margin-bottom: 2rem;
    color: #333;
    font-size: 2rem;
  }
`;

const SectionStats = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const MiniStat = styled.div`
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .label {
    color: #666;
    font-weight: 500;
  }

  .value {
    color: #333;
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

const ControlsContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  min-width: 150px;
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

  &.secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #5a6268;
      transform: translateY(-2px);
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 4rem;

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const NotificationManagement: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<NotificationFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [filters, pagination.page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response: NotificationsResponse = await apiService.getNotifications(filters, {
        page: pagination.page,
        limit: pagination.limit,
      });
      setNotifications(response.notifications);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || 'Lỗi tải dữ liệu thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilter = (newFilters: NotificationFiltersType) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      // Reset về trang đầu tiên
      setPagination(prev => ({ ...prev, page: 1 }));
      // Tải lại dữ liệu với filters hiện tại
      const response: NotificationsResponse = await apiService.getNotifications(filters, {
        page: 1,
        limit: pagination.limit,
      });
      setNotifications(response.notifications);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || 'Lỗi tải dữ liệu thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleViewNotification = async (notificationId: string) => {
    try {
      const notification = await apiService.getNotificationDetails(notificationId);
      setSelectedNotification(notification);
      setShowNotificationDetails(true);
    } catch (error: any) {
      alert('Lỗi tải chi tiết thông báo: ' + error.message);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;

    try {
      await apiService.deleteNotification(notificationId);
      alert('Xóa thông báo thành công!');
      // Đóng modal nếu đang mở
      setShowNotificationDetails(false);
      setSelectedNotification(null);
      // Tải lại danh sách thông báo
      loadNotifications();
    } catch (error: any) {
      alert('Lỗi xóa thông báo: ' + error.message);
    }
  };

  const handleMarkAsRead = async (notificationId: string, readFlag: boolean) => {
    try {
      await apiService.markNotificationRead(notificationId, readFlag);
      alert(`Đánh dấu thông báo ${readFlag ? 'đã đọc' : 'chưa đọc'} thành công!`);
      // Đóng modal nếu đang mở
      setShowNotificationDetails(false);
      setSelectedNotification(null);
      // Tải lại danh sách thông báo
      loadNotifications();
    } catch (error: any) {
      alert('Lỗi đánh dấu thông báo: ' + error.message);
    }
  };

  const handleExport = () => {
    // Simple CSV export
    if (notifications.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const csvContent = [
      ['ID', 'Người nhận', 'Người gửi', 'Loại sự kiện', 'Tin nhắn', 'Ngày tạo', 'Trạng thái'],
      ...notifications.map(notification => [
        notification.notification_id,
        notification.toUser ? notification.toUser.username : 'Unknown',
        notification.fromUser ? notification.fromUser.username : 'Unknown',
        notification.event_type || 'Unknown',
        (notification.message || '').replace(/\n/g, ' ').substring(0, 100),
        new Date(notification.created_at).toLocaleString('vi-VN'),
        notification.read_flag ? 'Đã đọc' : 'Chưa đọc'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `notifications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && notifications.length === 0) {
    return (
      <LoadingSpinner>
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </LoadingSpinner>
    );
  }

  return (
    <Container>
      <h2>
        <i className="fas fa-bell" style={{ marginRight: '0.5rem' }}></i>
        Quản lý thông báo
      </h2>

      <SectionStats>
        <MiniStat>
          <span className="label">Tổng:</span>
          <span className="value">{pagination.total.toLocaleString()}</span>
        </MiniStat>
        <MiniStat>
          <span className="label">Trang hiện tại:</span>
          <span className="value">{pagination.page}</span>
        </MiniStat>
        <MiniStat>
          <span className="label">Tổng trang:</span>
          <span className="value">{pagination.totalPages}</span>
        </MiniStat>
      </SectionStats>

      <ControlsContainer>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Tìm kiếm thông báo..."
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button className="primary" onClick={() => loadNotifications()}>
            <i className="fas fa-search"></i> Tìm kiếm
          </Button>
        </SearchContainer>

        <FilterContainer>
          <FilterSelect
            onChange={(e) => {
              const value = e.target.value;
              let readFlag;
              if (value === 'read') {
                readFlag = true;
              } else if (value === 'unread') {
                readFlag = false;
              } else {
                readFlag = undefined; // Show all
              }
              handleFilter({ 
                ...filters, 
                readFlag: readFlag 
              });
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="read">Đã đọc</option>
            <option value="unread">Chưa đọc</option>
          </FilterSelect>

          <FilterSelect
            onChange={(e) => handleFilter({ ...filters, eventType: e.target.value || undefined })}
          >
            <option value="">Tất cả loại sự kiện</option>
            <option value="post.liked">Thích bài viết</option>
            <option value="post.commented">Bình luận bài viết</option>
            <option value="user.followed">Theo dõi người dùng</option>
            <option value="post.shared">Chia sẻ bài viết</option>
            <option value="post.mentioned">Được nhắc đến</option>
            <option value="post.created">Tạo bài viết</option>
            <option value="post.reacted">Tương tác bài viết</option>
            <option value="post.reaction.changed">Thay đổi tương tác</option>
            <option value="system">Hệ thống</option>
          </FilterSelect>

          <Button className="secondary" onClick={handleRefresh}>
            <i className="fas fa-sync-alt"></i> Làm mới
          </Button>

          <Button className="secondary" onClick={handleExport}>
            <i className="fas fa-download"></i> Xuất Excel
          </Button>
        </FilterContainer>
      </ControlsContainer>

      <NotificationTable
        notifications={notifications}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewNotification={handleViewNotification}
        onDeleteNotification={handleDeleteNotification}
        onMarkAsRead={handleMarkAsRead}
        loading={loading}
      />

      {showNotificationDetails && selectedNotification && (
        <NotificationDetailsModal
          notification={selectedNotification}
          onClose={() => setShowNotificationDetails(false)}
          onDeleteNotification={handleDeleteNotification}
          onMarkAsRead={handleMarkAsRead}
        />
      )}
    </Container>
  );
};

export default NotificationManagement;
