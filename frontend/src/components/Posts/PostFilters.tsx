import React from 'react';
import styled from 'styled-components';
import { PostFilters as PostFiltersType } from '../../types';

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  min-width: 150px;
`;

const FilterInput = styled.input`
  padding: 0.5rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
  min-width: 150px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
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

interface PostFiltersProps {
  filters: PostFiltersType;
  onFiltersChange: (filters: PostFiltersType) => void;
  onApply: () => void;
  onReset: () => void;
}

const PostFilters: React.FC<PostFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onReset,
}) => {
  const handleFilterChange = (key: keyof PostFiltersType, value: string) => {
    const newValue = value === '' ? undefined : value;
    onFiltersChange({ ...filters, [key]: newValue });
  };

  const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  return (
    <FilterContainer>
      <FilterSelect
        value={filters.type || ''}
        onChange={(e) => handleFilterChange('type', e.target.value)}
      >
        <option value="">Tất cả loại</option>
        <option value="ORIGINAL">Bài gốc</option>
        <option value="SHARE">Chia sẻ</option>
        <option value="text">Văn bản</option>
      </FilterSelect>

      <FilterSelect
        value={filters.visibility || ''}
        onChange={(e) => handleFilterChange('visibility', e.target.value)}
      >
        <option value="">Tất cả quyền riêng tư</option>
        <option value="PUBLIC">Công khai</option>
        <option value="PRIVATE">Riêng tư</option>
        <option value="FRIEND">Bạn bè</option>
        <option value="FOLLOWER">Người theo dõi</option>
      </FilterSelect>

      <FilterSelect
        value={filters.delete_flag === true ? 'deleted' : filters.delete_flag === false ? 'active' : ''}
        onChange={(e) => {
          const value = e.target.value;
          if (value === 'deleted') {
            onFiltersChange({ ...filters, delete_flag: true });
          } else if (value === 'active') {
            onFiltersChange({ ...filters, delete_flag: false });
          } else {
            onFiltersChange({ ...filters, delete_flag: undefined });
          }
        }}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="active">Hoạt động</option>
        <option value="deleted">Đã xóa</option>
      </FilterSelect>

      <FilterInput
        type="text"
        placeholder="Tác giả (ID hoặc username)"
        value={filters.authorId || ''}
        onChange={(e) => handleFilterChange('authorId', e.target.value)}
      />

      <FilterInput
        type="date"
        placeholder="Từ ngày"
        value={filters.startDate || ''}
        onChange={(e) => handleDateChange('startDate', e.target.value)}
      />

      <FilterInput
        type="date"
        placeholder="Đến ngày"
        value={filters.endDate || ''}
        onChange={(e) => handleDateChange('endDate', e.target.value)}
      />

      <FilterSelect
        value={filters.sortBy || ''}
        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
      >
        <option value="">Sắp xếp theo</option>
        <option value="created_at">Ngày tạo</option>
        <option value="updated_at">Ngày cập nhật</option>
        <option value="content">Nội dung</option>
      </FilterSelect>

      <FilterSelect
        value={filters.sortOrder || ''}
        onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'ASC' | 'DESC')}
      >
        <option value="">Thứ tự</option>
        <option value="ASC">Tăng dần</option>
        <option value="DESC">Giảm dần</option>
      </FilterSelect>

      <Button className="primary" onClick={onApply}>
        <i className="fas fa-filter"></i> Áp dụng
      </Button>

      <Button className="secondary" onClick={onReset}>
        <i className="fas fa-undo"></i> Reset
      </Button>
    </FilterContainer>
  );
};

export default PostFilters;
