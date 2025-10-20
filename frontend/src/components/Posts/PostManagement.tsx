import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../../services/api';
import { PostsResponse, Post, PostFilters as PostFiltersType } from '../../types';
import PostTable from './PostTable';
import PostDetailsModal from './PostDetailsModal';
import CommentsModal from './CommentsModal';

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

const PostManagement: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<PostFiltersType>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostDetails, setShowPostDetails] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState<string>('');

  useEffect(() => {
    loadPosts();
  }, [filters, pagination.page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response: PostsResponse = await apiService.getPosts(filters, {
        page: pagination.page,
        limit: pagination.limit,
      });
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || 'Lỗi tải dữ liệu bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilter = (newFilters: PostFiltersType) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleViewPost = async (postId: string) => {
    try {
      const post = await apiService.getPostDetails(postId);
      setSelectedPost(post);
      setShowPostDetails(true);
    } catch (error: any) {
      alert('Lỗi tải chi tiết bài viết: ' + error.message);
    }
  };

  const handleViewComments = (postId: string) => {
    setCommentsPostId(postId);
    setShowComments(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
      await apiService.deletePost(postId);
      alert('Xóa bài viết thành công!');
      loadPosts();
    } catch (error: any) {
      alert('Lỗi xóa bài viết: ' + error.message);
    }
  };

  const handleRestorePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục bài viết này?')) return;

    try {
      await apiService.restorePost(postId);
      alert('Khôi phục bài viết thành công!');
      loadPosts();
    } catch (error: any) {
      alert('Lỗi khôi phục bài viết: ' + error.message);
    }
  };

  const handleExport = () => {
    // Simple CSV export
    if (posts.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const csvContent = [
      ['ID', 'Tác giả', 'Loại', 'Quyền riêng tư', 'Nội dung', 'Ngày tạo', 'Trạng thái'],
      ...posts.map(post => [
        post.post_id,
        post.author ? post.author.username : 'Unknown',
        post.type || 'Unknown',
        post.visibility || 'Unknown',
        (post.content || '').replace(/\n/g, ' ').substring(0, 100),
        new Date(post.created_at).toLocaleString('vi-VN'),
        post.delete_flag ? 'Đã xóa' : 'Hoạt động'
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `posts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && posts.length === 0) {
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
        <i className="fas fa-file-alt" style={{ marginRight: '0.5rem' }}></i>
        Quản lý bài viết
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
            placeholder="Tìm kiếm bài viết..."
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button className="primary" onClick={() => loadPosts()}>
            <i className="fas fa-search"></i> Tìm kiếm
          </Button>
        </SearchContainer>

        <FilterContainer>
          <FilterSelect
            onChange={(e) => handleFilter({ ...filters, type: e.target.value || undefined })}
          >
            <option value="">Tất cả loại</option>
            <option value="ORIGINAL">Bài gốc</option>
            <option value="SHARE">Chia sẻ</option>
            <option value="text">Văn bản</option>
          </FilterSelect>

          <FilterSelect
            onChange={(e) => handleFilter({ ...filters, visibility: e.target.value || undefined })}
          >
            <option value="">Tất cả quyền riêng tư</option>
            <option value="PUBLIC">Công khai</option>
            <option value="PRIVATE">Riêng tư</option>
            <option value="FRIEND">Bạn bè</option>
            <option value="FOLLOWER">Người theo dõi</option>
          </FilterSelect>

          <FilterSelect
            onChange={(e) => handleFilter({ 
              ...filters, 
              delete_flag: e.target.value === 'deleted' ? true : undefined 
            })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="deleted">Đã xóa</option>
          </FilterSelect>

          <Button className="secondary" onClick={() => loadPosts()}>
            <i className="fas fa-sync-alt"></i> Làm mới
          </Button>

          <Button className="secondary" onClick={handleExport}>
            <i className="fas fa-download"></i> Xuất Excel
          </Button>
        </FilterContainer>
      </ControlsContainer>

      <PostTable
        posts={posts}
        pagination={pagination}
        onPageChange={handlePageChange}
        onViewPost={handleViewPost}
        onViewComments={handleViewComments}
        onDeletePost={handleDeletePost}
        onRestorePost={handleRestorePost}
        loading={loading}
      />

      {showPostDetails && selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          onClose={() => setShowPostDetails(false)}
          onViewComments={handleViewComments}
          onDeletePost={handleDeletePost}
          onRestorePost={handleRestorePost}
        />
      )}

      {showComments && (
        <CommentsModal
          postId={commentsPostId}
          onClose={() => setShowComments(false)}
        />
      )}
    </Container>
  );
};

export default PostManagement;
