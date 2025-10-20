import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiService } from '../../services/api';
import { CommentsResponse, Comment } from '../../types';

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

const CommentItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;

  &:last-child {
    border-bottom: none;
  }
`;

const CommentAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CommentAuthor = styled.strong`
  color: #333;
`;

const CommentDate = styled.small`
  color: #666;
`;

const CommentText = styled.div`
  color: #333;
  margin-bottom: 0.5rem;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;

  &.danger {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
      transform: translateY(-1px);
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 2rem;

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;

  i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #ccc;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid #dee2e6;
  margin-top: 1rem;
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

const PaginationButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
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
`;

interface CommentsModalProps {
  postId: string;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ postId, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadComments();
  }, [postId, pagination.page]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response: CommentsResponse = await apiService.getPostComments(postId, {
        page: pagination.page,
        limit: pagination.limit,
      });
      setComments(response.comments);
      setPagination(response.pagination);
    } catch (error: any) {
      setError(error.message || 'Lỗi tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;

    try {
      await apiService.deleteComment(commentId);
      alert('Xóa bình luận thành công!');
      loadComments();
    } catch (error: any) {
      alert('Lỗi xóa bình luận: ' + error.message);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && comments.length === 0) {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <h3>Bình luận</h3>
            <CloseButton onClick={onClose}>
              <i className="fas fa-times"></i>
            </CloseButton>
          </ModalHeader>
          <ModalBody>
            <LoadingSpinner>
              <div className="spinner"></div>
              <p>Đang tải bình luận...</p>
            </LoadingSpinner>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>
            <i className="fas fa-comments" style={{ marginRight: '0.5rem' }}></i>
            Bình luận ({pagination.total})
          </h3>
          <CloseButton onClick={onClose}>
            <i className="fas fa-times"></i>
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {comments.length === 0 ? (
            <EmptyState>
              <i className="fas fa-comments"></i>
              <p>Chưa có bình luận nào</p>
            </EmptyState>
          ) : (
            <>
              {comments.map((comment) => (
                <CommentItem key={comment.comment_id}>
                  <CommentAvatar>
                    {comment.author ? comment.author.username.charAt(0).toUpperCase() : 'U'}
                  </CommentAvatar>
                  <CommentContent>
                    <CommentHeader>
                      <CommentAuthor>
                        {comment.author ? comment.author.username : 'Unknown'}
                      </CommentAuthor>
                      <CommentDate>
                        {new Date(comment.created_at).toLocaleString('vi-VN')}
                      </CommentDate>
                    </CommentHeader>
                    <CommentText>{comment.content}</CommentText>
                    <CommentActions>
                      <Button
                        className="danger"
                        onClick={() => handleDeleteComment(comment.comment_id)}
                        title="Xóa bình luận"
                      >
                        <i className="fas fa-trash"></i> Xóa
                      </Button>
                    </CommentActions>
                  </CommentContent>
                </CommentItem>
              ))}

              {pagination.totalPages > 1 && (
                <PaginationContainer>
                  <PaginationInfo>
                    Hiển thị {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} của {pagination.total}
                  </PaginationInfo>
                  <PaginationControls>
                    <PaginationButton
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <i className="fas fa-chevron-left"></i> Trước
                    </PaginationButton>
                    <span>{pagination.page}</span>
                    <PaginationButton
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Sau <i className="fas fa-chevron-right"></i>
                    </PaginationButton>
                  </PaginationControls>
                </PaginationContainer>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CommentsModal;
