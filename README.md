# SME Admin Service

Admin Dashboard cho hệ thống Social Media Enterprise (SME) - cung cấp giao diện quản trị và thống kê toàn diện.

## 🚀 Tính năng

### 📊 Dashboard Tổng quan
- Thống kê tổng quan về người dùng, bài viết, bình luận, tương tác
- Biểu đồ trực quan với Chart.js
- Cập nhật dữ liệu real-time

### 👥 Quản lý Người dùng
- Thống kê người dùng theo thời gian (hôm nay, tuần, tháng)
- Danh sách người dùng gần đây
- Thông tin chi tiết người dùng

### 📝 Quản lý Nội dung
- Thống kê bài viết và bình luận
- Phân loại bài viết theo loại
- Bài viết có nhiều tương tác nhất
- Bài viết có nhiều bình luận nhất

### ❤️ Quản lý Tương tác
- Thống kê các loại reaction
- Phân bố tương tác theo đối tượng
- Top bài viết có nhiều tương tác

### 🔔 Quản lý Thông báo
- Thống kê thông báo theo loại sự kiện
- Thông báo chưa đọc
- Lịch sử thông báo gần đây

### 🏥 Giám sát Hệ thống
- Trạng thái kết nối các database
- Health check real-time
- Thông tin response time

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** với **Express.js**
- **PostgreSQL** - Lưu trữ thông tin người dùng
- **Apache Cassandra** - Lưu trữ bài viết, bình luận, reactions, notifications
- **Neo4j** - Graph database cho mối quan hệ
- **Redis** - Cache và session storage
- **JWT** - Authentication và authorization

### Frontend
- **HTML5/CSS3** - Giao diện responsive
- **Vanilla JavaScript** - Logic tương tác
- **Chart.js** - Biểu đồ trực quan
- **Font Awesome** - Icons

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL, Cassandra, Neo4j, Redis (hoặc sử dụng Docker)

### Cài đặt thủ công

1. **Clone repository và di chuyển vào thư mục admin-service**
```bash
cd admin-service
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình environment variables**
```bash
cp env.example .env
# Chỉnh sửa file .env với thông tin database của bạn
```

4. **Chạy ứng dụng**
```bash
# Development
npm run dev

# Production
npm start
```

### Cài đặt với Docker

1. **Chạy toàn bộ hệ thống với Docker Compose**
```bash
# Từ thư mục gốc của project
docker-compose up -d
```

2. **Truy cập Admin Dashboard**
```
http://localhost:3001
```

## 🔐 Đăng nhập

**Thông tin đăng nhập mặc định:**
- Username: `admin`
- Password: `admin123`

> ⚠️ **Lưu ý bảo mật**: Thay đổi mật khẩu mặc định trong production!

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập admin
- `POST /api/auth/logout` - Đăng xuất

### Statistics
- `GET /api/stats/dashboard` - Tổng quan dashboard
- `GET /api/stats/users` - Thống kê người dùng
- `GET /api/stats/posts` - Thống kê bài viết
- `GET /api/stats/comments` - Thống kê bình luận
- `GET /api/stats/reactions` - Thống kê tương tác
- `GET /api/stats/notifications` - Thống kê thông báo
- `GET /api/stats/health` - Trạng thái hệ thống

### Health Check
- `GET /health` - Kiểm tra sức khỏe service

## 🗄️ Cấu trúc Database

### PostgreSQL (User Service)
- Bảng `User` - Thông tin người dùng

### Cassandra
- **Keyspace**: `sme_notification_keyspace`
  - `sme_notifications` - Thông báo
  - `sme_notifications_by_user` - Thông báo theo người dùng
  - `sme_notifications_by_user_and_entity` - Thông báo theo người dùng và entity

- **Keyspace**: `sme_post_keyspace`
  - `sme_posts` - Bài viết
  - `sme_posts_by_author` - Bài viết theo tác giả
  - `sme_comments` - Bình luận
  - `sme_comments_by_post` - Bình luận theo bài viết

- **Keyspace**: `sme_reaction_keyspace`
  - `sme_reactions` - Tương tác
  - `sme_reaction_counts` - Đếm tương tác

### Neo4j
- Graph database cho mối quan hệ giữa các entities

### Redis
- Cache và session storage

## 🔧 Cấu hình

### Environment Variables

```env
# Database Connections
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=db_owner
POSTGRES_PASSWORD=db_owner
POSTGRES_DB=sme_user

CASSANDRA_HOST=localhost
CASSANDRA_PORT=9042
CASSANDRA_KEYSPACE_NOTIFICATION=sme_notification_keyspace
CASSANDRA_KEYSPACE_POST=sme_post_keyspace
CASSANDRA_KEYSPACE_REACTION=sme_reaction_keyspace

NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=

REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=3001
NODE_ENV=development

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## 🚀 Deployment

### Docker Production
```bash
# Build và chạy
docker-compose up -d admin-service

# Xem logs
docker-compose logs -f admin-service

# Restart service
docker-compose restart admin-service
```

### Health Check
```bash
# Kiểm tra service
curl http://localhost:3001/health

# Kiểm tra database connections
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3001/api/stats/health
```

## 📈 Monitoring

- **Real-time Dashboard**: Cập nhật dữ liệu mỗi 30 giây
- **Health Monitoring**: Kiểm tra trạng thái database
- **Error Logging**: Log chi tiết lỗi và debug info
- **Performance Metrics**: Response time và connection status

## 🔒 Bảo mật

- **JWT Authentication**: Token-based authentication
- **Rate Limiting**: Giới hạn số request
- **CORS Protection**: Cấu hình CORS phù hợp
- **Helmet Security**: Security headers
- **Input Validation**: Validate tất cả input

## 🐛 Troubleshooting

### Lỗi kết nối Database
```bash
# Kiểm tra trạng thái containers
docker-compose ps

# Xem logs
docker-compose logs postgres cassandra neo4j redis

# Restart services
docker-compose restart postgres cassandra neo4j redis
```

### Lỗi Authentication
- Kiểm tra JWT_SECRET trong environment
- Xóa localStorage và đăng nhập lại
- Kiểm tra token expiration

### Performance Issues
- Kiểm tra memory usage của containers
- Tối ưu database queries
- Kiểm tra network latency

## 📝 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 👥 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ team phát triển.

---

**SME Admin Service** - Quản lý và giám sát hệ thống Social Media Enterprise một cách hiệu quả! 🚀
