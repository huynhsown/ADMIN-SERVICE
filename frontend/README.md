# SME Admin Dashboard - Frontend

Ứng dụng React TypeScript cho admin dashboard của hệ thống SME Social Media Platform.

## 🚀 Tính năng

- **Dashboard Overview**: Tổng quan thống kê hệ thống với biểu đồ
- **Post Management**: Quản lý bài viết với tìm kiếm, lọc, phân trang
- **User Management**: Quản lý người dùng
- **Real-time Data**: Dữ liệu real-time từ các microservices
- **Responsive Design**: Giao diện responsive cho mọi thiết bị
- **Modern UI**: Sử dụng styled-components và modern design patterns

## 🛠️ Công nghệ

- **React 18** với TypeScript
- **Styled Components** cho styling
- **React Router** cho navigation
- **Recharts** cho biểu đồ
- **Axios** cho API calls
- **Font Awesome** cho icons

## 📦 Cài đặt

```bash
cd frontend
npm install
```

## 🚀 Chạy ứng dụng

```bash
# Development
npm start

# Production build
npm run build
```

## 🔧 Cấu hình

Ứng dụng sẽ chạy trên `http://localhost:3000` và kết nối với backend API tại `http://localhost:3001/api`.

## 📁 Cấu trúc thư mục

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard components
│   ├── Layout/         # Layout components
│   └── Posts/          # Post management components
├── contexts/           # React contexts
├── services/           # API services
├── types/              # TypeScript type definitions
└── App.tsx            # Main App component
```

## 🔐 Authentication

- Sử dụng JWT token để xác thực
- Token được lưu trong localStorage
- Tự động redirect về login khi token hết hạn

## 📊 API Integration

Tất cả API calls được quản lý thông qua `ApiService` class với:
- Automatic token management
- Error handling
- Request/Response interceptors
- TypeScript type safety

## 🎨 Styling

Sử dụng styled-components với:
- Theme-based styling
- Responsive design
- Modern UI components
- Consistent design system

## 🚀 Deployment

```bash
# Build for production
npm run build

# Serve static files
npx serve -s build
```

## 📝 Scripts

- `npm start`: Chạy development server
- `npm run build`: Build production version
- `npm test`: Chạy tests
- `npm run eject`: Eject từ Create React App