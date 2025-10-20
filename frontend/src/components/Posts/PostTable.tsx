import React from 'react';
import styled from 'styled-components';
import { Post, Pagination } from '../../types';

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

const StatusBadge = styled.span<{ $status: 'active' | 'deleted' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => props.$status === 'active' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$status === 'active' ? '#155724' : '#721c24'};
`;

const ActionButton = styled.button<{ $type: 'view' | 'edit' | 'delete' | 'restore' }>`
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

  &.edit {
    background: #28a745;
    color: white;
  }

  &.delete {
    background: #dc3545;
    color: white;
  }

  &.restore {
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

interface PostTableProps {
  posts: Post[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onViewPost: (postId: string) => void;
  onViewComments: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onRestorePost: (postId: string) => void;
  loading: boolean;
}

const PostTable: React.FC<PostTableProps> = ({
  posts,
  pagination,
  onPageChange,
  onViewPost,
  onViewComments,
  onDeletePost,
  onRestorePost,
  loading,
}) => {
  const { page, limit, total, totalPages } = pagination;

  if (loading && posts.length === 0) {
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
        <h3>Danh sách bài viết</h3>
      </TableHeader>

      <TableWrapper>
        <Table>
          <TableHead>
            <tr>
              <th>ID</th>
              <th>Tác giả</th>
              <th>Loại</th>
              <th>Quyền riêng tư</th>
              <th>Nội dung</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <tr key={post.post_id}>
                <td title={post.post_id}>
                  {post.post_id.substring(0, 8)}...
                </td>
                <td>
                  {post.author ? (
                    <div>
                      <strong>{post.author.username}</strong><br />
                      <small>{post.author.firstName} {post.author.lastName}</small>
                    </div>
                  ) : (
                    'Unknown'
                  )}
                </td>
                <td>{post.type || 'Unknown'}</td>
                <td>{post.visibility || 'Unknown'}</td>
                <td>
                  <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {post.content ? post.content.substring(0, 100) + '...' : 'No content'}
                  </div>
                </td>
                <td>{post.reactions?.total || 0}</td>
                <td>{post.commentsCount || 0}</td>
                <td>{new Date(post.created_at).toLocaleString('vi-VN')}</td>
                <td>
                  <StatusBadge $status={post.delete_flag ? 'deleted' : 'active'}>
                    {post.delete_flag ? 'Đã xóa' : 'Hoạt động'}
                  </StatusBadge>
                </td>
                <td>
                  <ActionButton
                    $type="view"
                    className="view"
                    onClick={() => onViewPost(post.post_id)}
                    title="Xem chi tiết"
                  >
                    <i className="fas fa-eye"></i>
                  </ActionButton>
                  <ActionButton
                    $type="view"
                    className="view"
                    onClick={() => onViewComments(post.post_id)}
                    title="Xem bình luận"
                  >
                    <i className="fas fa-comments"></i>
                  </ActionButton>
                  {post.delete_flag ? (
                    <ActionButton
                      $type="restore"
                      className="restore"
                      onClick={() => onRestorePost(post.post_id)}
                      title="Khôi phục"
                    >
                      <i className="fas fa-undo"></i>
                    </ActionButton>
                  ) : (
                    <ActionButton
                      $type="delete"
                      className="delete"
                      onClick={() => onDeletePost(post.post_id)}
                      title="Xóa"
                    >
                      <i className="fas fa-trash"></i>
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

export default PostTable;
