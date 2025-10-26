import React from 'react';
import styled from 'styled-components';
import { Post } from '../../types';

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
  max-width: 1200px;
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

const PostDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PostInfo = styled.div`
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

const PostContent = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;

  h4 {
    margin-bottom: 1rem;
    color: #333;
  }
`;

const PostText = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const PostMedia = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const MediaItem = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
`;

const Hashtags = styled.div`
  margin-top: 1rem;

  span {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #e9ecef;
    color: #495057;
    border-radius: 20px;
    font-size: 0.8rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
`;

const PostActions = styled.div`
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

const StatusBadge = styled.span<{ $status: 'active' | 'deleted' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => props.$status === 'active' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$status === 'active' ? '#155724' : '#721c24'};
`;

interface PostDetailsModalProps {
  post: Post;
  onClose: () => void;
  onViewComments: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onRestorePost: (postId: string) => void;
}

const PostDetailsModal: React.FC<PostDetailsModalProps> = ({
  post,
  onClose,
  onViewComments,
  onDeletePost,
  onRestorePost,
}) => {
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>
            <i className="fas fa-file-alt" style={{ marginRight: '0.5rem' }}></i>
            Chi tiết bài viết
          </h3>
          <CloseButton onClick={onClose}>
            <i className="fas fa-times"></i>
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <PostDetails>
            <PostInfo>
              <h4>Thông tin bài viết</h4>
              <InfoItem>
                <InfoLabel>ID:</InfoLabel>
                <InfoValue>{post.post_id}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Tác giả:</InfoLabel>
                <InfoValue>{post.author ? post.author.username : 'Unknown'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Loại:</InfoLabel>
                <InfoValue>{post.type || 'Unknown'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Quyền riêng tư:</InfoLabel>
                <InfoValue>{post.visibility || 'Unknown'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Ngày tạo:</InfoLabel>
                <InfoValue>{new Date(post.created_at).toLocaleString('vi-VN')}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Ngày cập nhật:</InfoLabel>
                <InfoValue>{new Date(post.updated_at).toLocaleString('vi-VN')}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Trạng thái:</InfoLabel>
                <InfoValue>
                  <StatusBadge $status={post.delete_flag ? 'deleted' : 'active'}>
                    {post.delete_flag ? 'Đã xóa' : 'Hoạt động'}
                  </StatusBadge>
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Likes:</InfoLabel>
                <InfoValue>{post.reactions?.total || 0}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Comments:</InfoLabel>
                <InfoValue>{post.commentsCount || 0}</InfoValue>
              </InfoItem>
            </PostInfo>

            <PostContent>
              <h4>Nội dung</h4>
              <PostText>{post.content || 'Không có nội dung'}</PostText>

              {post.media && post.media.length > 0 && (
                <>
                  <h4>Media ({post.media.length})</h4>
                  <PostMedia>
                    {post.media.map((media, index) => (
                      <MediaItem key={index}>
                        <img src={media.media_url} alt="Media" onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} />
                      </MediaItem>
                    ))}
                  </PostMedia>
                </>
              )}

              {post.hashtags && post.hashtags.length > 0 && (
                <>
                  <h4>Hashtags</h4>
                  <Hashtags>
                    {post.hashtags.map((hashtag, index) => (
                      <span key={index}>#{hashtag.tag}</span>
                    ))}
                  </Hashtags>
                </>
              )}

              <PostActions>
                <Button
                  className="primary"
                  onClick={() => onViewComments(post.post_id)}
                >
                  <i className="fas fa-comments"></i> Xem bình luận
                </Button>
                {post.delete_flag ? (
                  <Button
                    className="warning"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestorePost(post.post_id);
                    }}
                  >
                    <i className="fas fa-undo"></i> Khôi phục
                  </Button>
                ) : (
                  <Button
                    className="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePost(post.post_id);
                    }}
                  >
                    <i className="fas fa-trash"></i> Xóa
                  </Button>
                )}
              </PostActions>
            </PostContent>
          </PostDetails>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PostDetailsModal;
