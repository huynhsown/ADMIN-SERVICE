import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiService } from '../../services/api';
import { DashboardOverview } from '../../types';
import StatsCard from './StatsCard';

const Container = styled.div`
  h2 {
    margin-bottom: 2rem;
    color: #333;
    font-size: 2rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ChartContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

  h3 {
    margin-bottom: 1rem;
    color: #333;
    text-align: center;
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

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

const Overview: React.FC = () => {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const overview = await apiService.getDashboardOverview();
      setData(overview);
    } catch (error: any) {
      setError(error.message || 'Lỗi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner>
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </LoadingSpinner>
    );
  }

  if (error) {
    return (
      <Container>
        <h2>Lỗi tải dữ liệu</h2>
        <p>{error}</p>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <h2>Không có dữ liệu</h2>
      </Container>
    );
  }

  // Prepare chart data
  const userChartData = [
    { name: 'Tổng', value: data.users.total },
    { name: 'Hôm nay', value: data.users.today },
    { name: 'Tuần này', value: data.users.week },
    { name: 'Tháng này', value: data.users.month },
  ];

  const postTypeData = Object.entries(data.posts.byType).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const reactionTypeData = data.reactions.byType.map((item, index) => ({
    name: item.reaction_type,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Container>
      <h2>
        <i className="fas fa-tachometer-alt" style={{ marginRight: '0.5rem' }}></i>
        Tổng quan hệ thống
      </h2>

      <StatsGrid>
        <StatsCard
          type="users"
          value={data.users.total}
          label="Tổng người dùng"
          subLabel={`Hôm nay: ${data.users.today.toLocaleString()}`}
          icon="fas fa-users"
        />
        <StatsCard
          type="posts"
          value={data.posts.total}
          label="Tổng bài viết"
          subLabel={`Hôm nay: ${data.posts.today.toLocaleString()}`}
          icon="fas fa-file-alt"
        />
        <StatsCard
          type="comments"
          value={data.comments.total}
          label="Tổng bình luận"
          subLabel={`Hôm nay: ${data.comments.today.toLocaleString()}`}
          icon="fas fa-comments"
        />
        <StatsCard
          type="reactions"
          value={data.reactions.total}
          label="Tổng tương tác"
          subLabel={`${data.reactions.byType.length} loại`}
          icon="fas fa-heart"
        />
      </StatsGrid>

      <ChartsGrid>
        <ChartContainer>
          <h3>Thống kê người dùng theo thời gian</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer>
          <h3>Phân bố loại bài viết</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={postTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {postTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartsGrid>
    </Container>
  );
};

export default Overview;
