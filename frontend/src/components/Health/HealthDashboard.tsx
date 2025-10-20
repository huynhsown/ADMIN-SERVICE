import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../../services/api';
import { SystemHealth } from '../../types';

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
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RefreshButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HealthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const HealthCard = styled.div<{ status: 'healthy' | 'unhealthy' }>`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.status === 'healthy' ? '#28a745' : '#dc3545'};
`;

const ServiceName = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  
  &.healthy {
    background: #d4edda;
    color: #155724;
  }

  &.warning {
    background: #fff3cd;
    color: #856404;
  }

  &.unhealthy {
    background: #f8d7da;
    color: #721c24;
  }
`;

const ServiceInfo = styled.div`
  margin-bottom: 0.5rem;
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #495057;
  margin-right: 0.5rem;
`;

const InfoValue = styled.span`
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SystemInfo = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SystemInfoTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
`;

const InfoItemLabel = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const InfoItemValue = styled.div`
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
`;

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  lastChecked: string;
  error?: string;
}

const HealthDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSystemHealth();
      setHealth(response);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi khi tải thông tin hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'unhealthy':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Hoạt động tốt';
      case 'unhealthy':
        return 'Lỗi';
      default:
        return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <Container>
        <Header>
          <Title>🏥 Trạng thái Hệ thống</Title>
        </Header>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>🏥 Trạng thái Hệ thống</Title>
        <RefreshButton onClick={fetchHealth} disabled={loading}>
          <i className="fas fa-sync-alt"></i>
          Làm mới
        </RefreshButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {health && (
        <>
          <HealthGrid>
            {/* Database Health */}
            {Object.entries(health.databases).map(([name, status]) => (
              <HealthCard key={name} status={status.status}>
                <ServiceName>
                  {getStatusIcon(status.status)}
                  {name.toUpperCase()}
                </ServiceName>
                
                <StatusBadge className={status.status}>
                  {getStatusText(status.status)}
                </StatusBadge>

                <ServiceInfo>
                  <InfoLabel>Thời gian phản hồi:</InfoLabel>
                  <InfoValue>
                    {status.responseTime ? `${status.responseTime}ms` : 'N/A'}
                  </InfoValue>
                </ServiceInfo>

                <ServiceInfo>
                  <InfoLabel>Kiểm tra lần cuối:</InfoLabel>
                  <InfoValue>
                    {new Date(health.timestamp).toLocaleString('vi-VN')}
                  </InfoValue>
                </ServiceInfo>

                {status.error && (
                  <ServiceInfo>
                    <InfoLabel>Lỗi:</InfoLabel>
                    <InfoValue style={{ color: '#dc3545' }}>
                      {status.error}
                    </InfoValue>
                  </ServiceInfo>
                )}
              </HealthCard>
            ))}

            {/* Services Health */}
            {Object.entries(health.services).map(([name, status]) => (
              <HealthCard key={name} status={status.status}>
                <ServiceName>
                  {getStatusIcon(status.status)}
                  {name}
                </ServiceName>
                
                <StatusBadge className={status.status}>
                  {getStatusText(status.status)}
                </StatusBadge>

                <ServiceInfo>
                  <InfoLabel>Thời gian phản hồi:</InfoLabel>
                  <InfoValue>
                    {status.responseTime ? `${status.responseTime}ms` : 'N/A'}
                  </InfoValue>
                </ServiceInfo>

                <ServiceInfo>
                  <InfoLabel>Kiểm tra lần cuối:</InfoLabel>
                  <InfoValue>
                    {new Date(health.timestamp).toLocaleString('vi-VN')}
                  </InfoValue>
                </ServiceInfo>

                {status.error && (
                  <ServiceInfo>
                    <InfoLabel>Lỗi:</InfoLabel>
                    <InfoValue style={{ color: '#dc3545' }}>
                      {status.error}
                    </InfoValue>
                  </ServiceInfo>
                )}
              </HealthCard>
            ))}
          </HealthGrid>

          <SystemInfo>
            <SystemInfoTitle>
              📊 Thông tin Hệ thống
            </SystemInfoTitle>
            
            <InfoGrid>
              <InfoItem>
                <InfoItemLabel>Cập nhật lần cuối</InfoItemLabel>
                <InfoItemValue>
                  {new Date(health.timestamp).toLocaleString('vi-VN')}
                </InfoItemValue>
              </InfoItem>
            </InfoGrid>
          </SystemInfo>
        </>
      )}
    </Container>
  );
};

export default HealthDashboard;
