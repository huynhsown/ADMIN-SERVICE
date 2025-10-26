import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  DashboardOverview, 
  UserStats, 
  PostStats, 
  CommentStats, 
  ReactionStats, 
  NotificationStats, 
  SystemHealth,
  PostsResponse,
  CommentsResponse,
  SearchResponse,
  Post,
  PostFilters,
  NotificationsResponse,
  Notification,
  NotificationFilters
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 10000,
    });

    // Load token from localStorage
    this.token = localStorage.getItem('adminToken');
    if (this.token) {
      this.setAuthToken(this.token);
    }

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem('adminToken', token);
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    this.token = null;
    localStorage.removeItem('adminToken');
    delete this.api.defaults.headers.common['Authorization'];
  }

  logout() {
    this.clearAuthToken();
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials);
    this.setAuthToken(response.data.token);
    return response.data;
  }

  async logoutApi(): Promise<void> {
    await this.api.post('/auth/logout');
    this.clearAuthToken();
  }

  // Stats endpoints
  async getDashboardOverview(): Promise<DashboardOverview> {
    const response: AxiosResponse<DashboardOverview> = await this.api.get('/stats/dashboard');
    return response.data;
  }

  async getUserStats(): Promise<UserStats> {
    const response: AxiosResponse<UserStats> = await this.api.get('/stats/users');
    return response.data;
  }

  async getPostStats(): Promise<PostStats> {
    const response: AxiosResponse<PostStats> = await this.api.get('/stats/posts');
    return response.data;
  }

  async getCommentStats(): Promise<CommentStats> {
    const response: AxiosResponse<CommentStats> = await this.api.get('/stats/comments');
    return response.data;
  }

  async getReactionStats(): Promise<ReactionStats> {
    const response: AxiosResponse<ReactionStats> = await this.api.get('/stats/reactions');
    return response.data;
  }

  async getNotificationStats(): Promise<NotificationStats> {
    const response: AxiosResponse<NotificationStats> = await this.api.get('/notifications/stats/overview');
    return response.data;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const response: AxiosResponse<SystemHealth> = await this.api.get('/stats/health');
    return response.data;
  }

  // Posts endpoints
  async getPosts(filters: PostFilters = {}, pagination = { page: 1, limit: 20 }): Promise<PostsResponse> {
    const params = { ...filters, ...pagination };
    const response: AxiosResponse<PostsResponse> = await this.api.get('/posts', { params });
    return response.data;
  }

  async getPostDetails(postId: string): Promise<Post> {
    const response: AxiosResponse<Post> = await this.api.get(`/posts/${postId}`);
    return response.data;
  }

  async getPostComments(postId: string, pagination = { page: 1, limit: 20 }): Promise<CommentsResponse> {
    const response: AxiosResponse<CommentsResponse> = await this.api.get(`/posts/${postId}/comments`, { params: pagination });
    return response.data;
  }

  async deletePost(postId: string): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/posts/${postId}`);
    return response.data;
  }

  async restorePost(postId: string): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.patch(`/posts/${postId}/restore`);
    return response.data;
  }

  async deleteComment(commentId: string): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/posts/comments/${commentId}`);
    return response.data;
  }

  async searchPosts(query: string, filters: PostFilters = {}, pagination = { page: 1, limit: 20 }): Promise<SearchResponse> {
    const params = { q: query, ...filters, ...pagination };
    const response: AxiosResponse<SearchResponse> = await this.api.get('/posts/search', { params });
    return response.data;
  }

  async getPostsByHashtag(hashtag: string, pagination = { page: 1, limit: 20 }): Promise<PostsResponse> {
    const response: AxiosResponse<PostsResponse> = await this.api.get(`/posts/hashtag/${hashtag}`, { params: pagination });
    return response.data;
  }

  async getTrendingHashtags(): Promise<{ hashtags: Array<{ tag: string; count: number }> }> {
    const response: AxiosResponse<{ hashtags: Array<{ tag: string; count: number }> }> = await this.api.get('/posts/hashtags/trending');
    return response.data;
  }

  async getPostsByUser(userId: string, pagination = { page: 1, limit: 20 }): Promise<PostsResponse> {
    const response: AxiosResponse<PostsResponse> = await this.api.get(`/posts/user/${userId}`, { params: pagination });
    return response.data;
  }

  async getPostsByType(type: string, pagination = { page: 1, limit: 20 }): Promise<PostsResponse> {
    const response: AxiosResponse<PostsResponse> = await this.api.get(`/posts/type/${type}`, { params: pagination });
    return response.data;
  }

  // Generic GET method for any endpoint
  async get(url: string, config?: any): Promise<any> {
    const response = await this.api.get(url, config);
    return response;
  }

  // Generic POST method for any endpoint
  async post(url: string, data?: any, config?: any): Promise<any> {
    const response = await this.api.post(url, data, config);
    return response;
  }

  // Notifications endpoints
  async getNotifications(filters: NotificationFilters = {}, pagination = { page: 1, limit: 20 }): Promise<NotificationsResponse> {
    const params = { ...filters, ...pagination };
    const response: AxiosResponse<NotificationsResponse> = await this.api.get('/notifications', { params });
    return response.data;
  }

  async getNotificationDetails(notificationId: string): Promise<Notification> {
    const response: AxiosResponse<Notification> = await this.api.get(`/notifications/${notificationId}`);
    return response.data;
  }

  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  async markNotificationRead(notificationId: string, readFlag: boolean): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> = await this.api.patch(`/notifications/${notificationId}/read`, { readFlag });
    return response.data;
  }

  async searchNotifications(query: string, filters: NotificationFilters = {}, pagination = { page: 1, limit: 20 }): Promise<SearchResponse> {
    const params = { q: query, ...filters, ...pagination };
    const response: AxiosResponse<SearchResponse> = await this.api.get('/notifications/search', { params });
    return response.data;
  }

  async getNotificationsByUser(userId: string, pagination = { page: 1, limit: 20 }): Promise<NotificationsResponse> {
    const response: AxiosResponse<NotificationsResponse> = await this.api.get(`/notifications/user/${userId}`, { params: pagination });
    return response.data;
  }

  async getNotificationsByEventType(eventType: string, pagination = { page: 1, limit: 20 }): Promise<NotificationsResponse> {
    const response: AxiosResponse<NotificationsResponse> = await this.api.get(`/notifications/event/${eventType}`, { params: pagination });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
