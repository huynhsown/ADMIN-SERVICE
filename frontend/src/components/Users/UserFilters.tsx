import React, { useState } from 'react';
import styled from 'styled-components';

const FiltersContainer = styled.div`
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #dee2e6;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;

  &.primary {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }

  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  }

  &.outline {
    background: transparent;
    color: #6c757d;
    border: 1px solid #ced4da;
    
    &:hover {
      background: #f8f9fa;
      border-color: #adb5bd;
    }
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  
  &:hover {
    color: #495057;
  }
`;

interface UserFiltersState {
  search: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  pageSize?: string;
}

interface UserFiltersProps {
  filters: UserFiltersState;
  onFiltersChange: (filters: Partial<UserFiltersState>) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({ filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState<UserFiltersState>(filters);

  const handleInputChange = (field: keyof UserFiltersState, value: string) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
      pageSize: '20'
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== '' && value !== 'createdAt' && value !== 'desc'
  );

  return (
    <FiltersContainer>
      <FiltersGrid>
        <FilterGroup>
          <Label htmlFor="search">Tìm kiếm chung</Label>
          <Input
            id="search"
            type="text"
            placeholder="Tìm theo tên, email, username..."
            value={localFilters.search}
            onChange={(e) => handleInputChange('search', e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <Label htmlFor="firstName">Tên</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Tên"
            value={localFilters.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <Label htmlFor="lastName">Họ</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Họ"
            value={localFilters.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Username"
            value={localFilters.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={localFilters.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <Label htmlFor="sortBy">Sắp xếp theo</Label>
          <Select
            id="sortBy"
            value={localFilters.sortBy}
            onChange={(e) => handleInputChange('sortBy', e.target.value)}
          >
            <option value="createdAt">Ngày tạo</option>
            <option value="updatedAt">Ngày cập nhật</option>
            <option value="firstName">Tên</option>
            <option value="lastName">Họ</option>
            <option value="username">Username</option>
            <option value="email">Email</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <Label htmlFor="sortOrder">Thứ tự</Label>
          <Select
            id="sortOrder"
            value={localFilters.sortOrder}
            onChange={(e) => handleInputChange('sortOrder', e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <Label htmlFor="pageSize">Số lượng hiển thị</Label>
          <Select
            id="pageSize"
            value={localFilters.pageSize || '20'}
            onChange={(e) => handleInputChange('pageSize', e.target.value)}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </FilterGroup>
      </FiltersGrid>

      <FilterActions>
        <Button className="primary" onClick={handleApplyFilters}>
          Áp dụng bộ lọc
        </Button>
        <Button className="outline" onClick={handleClearFilters}>
          Xóa bộ lọc
        </Button>
        {hasActiveFilters && (
          <ClearButton onClick={handleClearFilters}>
            Xóa tất cả
          </ClearButton>
        )}
      </FilterActions>
    </FiltersContainer>
  );
};

export default UserFilters;
