import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../../services/api';

const StatsContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const StatsHeader = styled.div`
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const StatsTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const StatsContent = styled.div`
  padding: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f1f3f4;

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const StatValue = styled.span`
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  
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

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
`;

const ChartContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ChartTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
`;

const ChartBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ChartLabel = styled.span`
  width: 60px;
  font-size: 0.8rem;
  color: #6c757d;
`;

const ChartBarFill = styled.div<{ percentage: number }>`
  flex: 1;
  height: 8px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  margin: 0 0.5rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.percentage}%;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
`;

const ChartValue = styled.span`
  font-size: 0.8rem;
  color: #495057;
  font-weight: 600;
  min-width: 30px;
  text-align: right;
`;

interface UserStats {
  total: number;
  today: number;
  week: number;
  month: number;
  usersWithAvatars: number;
  usersWithPhone: number;
  usersByMonth: Array<{
    month: string;
    count: number;
  }>;
}

const UserStats: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get('/stats/users/analytics');
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  if (loading) {
    return (
      <StatsContainer>
        <StatsHeader>
          <StatsTitle>Thống kê Người dùng</StatsTitle>
        </StatsHeader>
        <StatsContent>
          <LoadingSpinner>
            <div className="spinner"></div>
          </LoadingSpinner>
        </StatsContent>
      </StatsContainer>
    );
  }

  if (error) {
    return (
      <StatsContainer>
        <StatsHeader>
          <StatsTitle>Thống kê Người dùng</StatsTitle>
        </StatsHeader>
        <StatsContent>
          <ErrorMessage>{error}</ErrorMessage>
        </StatsContent>
      </StatsContainer>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <StatsContainer>
      <StatsHeader>
        <StatsTitle>Thống kê Người dùng</StatsTitle>
      </StatsHeader>
      <StatsContent>
        <StatItem>
          <StatLabel>Tổng số người dùng</StatLabel>
          <StatValue>{formatNumber(stats.total)}</StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Hôm nay</StatLabel>
          <StatValue>{formatNumber(stats.today)}</StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Tuần này</StatLabel>
          <StatValue>{formatNumber(stats.week)}</StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Tháng này</StatLabel>
          <StatValue>{formatNumber(stats.month)}</StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Có avatar</StatLabel>
          <StatValue>{formatNumber(stats.usersWithAvatars)}</StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Có số điện thoại</StatLabel>
          <StatValue>{formatNumber(stats.usersWithPhone)}</StatValue>
        </StatItem>

        {stats.usersByMonth && stats.usersByMonth.length > 0 && (
          <ChartContainer>
            <ChartTitle>Đăng ký theo tháng (12 tháng gần nhất)</ChartTitle>
            {stats.usersByMonth.slice(-6).map((item, index) => {
              const percentage = getPercentage(item.count, Math.max(...stats.usersByMonth.map(m => m.count)));
              const monthName = new Date(item.month).toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
              
              return (
                <ChartBar key={index}>
                  <ChartLabel>{monthName}</ChartLabel>
                  <ChartBarFill percentage={percentage} />
                  <ChartValue>{item.count}</ChartValue>
                </ChartBar>
              );
            })}
          </ChartContainer>
        )}
      </StatsContent>
    </StatsContainer>
  );
};

export default UserStats;
