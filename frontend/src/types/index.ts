export interface User {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avtUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  post_id: string;
  author_id: string;
  type: string;
  root_post_id?: string;
  content: string;
  visibility: string;
  delete_flag: boolean;
  created_at: string;
  updated_at: string;
  author?: User;
  media?: Media[];
  mentions?: Mention[];
  hashtags?: Hashtag[];
  commentsCount?: number;
  reactions?: {
    total: number;
    byType: Array<{ reaction_type: string; count: number }>;
  };
}

export interface Comment {
  comment_id: string;
  post_id: string;
  author_id: string;
  parent_comment_id?: string;
  content: string;
  delete_flag: boolean;
  created_at: string;
  updated_at: string;
  author?: User;
}

export interface Media {
  media_id: string;
  media_url: string;
  metadata?: Record<string, string>;
}

export interface Mention {
  user_id: string;
  start_index: number;
  end_index: number;
}

export interface Hashtag {
  tag: string;
  created_at: string;
}

export interface PostStats {
  total: number;
  active: number;
  deleted: number;
  byType: Record<string, number>;
  byVisibility: Record<string, number>;
  today: number;
  week: number;
  month: number;
  topAuthors: Array<{ authorId: string; count: number }>;
}

export interface UserStats {
  total: number;
  today: number;
  week: number;
  month: number;
  recent: User[];
}

export interface CommentStats {
  total: number;
  today: number;
  week: number;
  topCommentedPosts: Array<{ post_id: string; comment_count: number }>;
}

export interface ReactionStats {
  total: number;
  byType: Array<{ reaction_type: string; count: number }>;
  byTargetType: Array<{ target_type: string; count: number }>;
  topReactedPosts: Array<{ target_id: string; target_type: string; reaction_count: number }>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Array<{ event_type: string; count: number }>;
  recent: Array<{
    notification_id: string;
    to_user_id: string;
    from_user_id: string;
    event_type: string;
    message: string;
    created_at: string;
  }>;
}

export interface DashboardOverview {
  users: UserStats;
  posts: PostStats;
  comments: CommentStats;
  reactions: ReactionStats;
  notifications: NotificationStats;
  timestamp: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: Pagination;
}

export interface SearchResponse {
  posts: Post[];
  pagination: Pagination;
  query: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

export interface SystemHealth {
  databases: {
    postgresql: HealthStatus;
    cassandra: HealthStatus;
    neo4j: HealthStatus;
    redis: HealthStatus;
  };
  services: Record<string, HealthStatus>;
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    username: string;
    role: string;
  };
}

export interface PostFilters {
  authorId?: string;
  type?: string;
  visibility?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  delete_flag?: boolean;
}

export interface UserFilters {
  search?: string;
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
  users: User[];
  pagination: Pagination;
}

export interface UserAnalytics {
  totalUsers: number;
  usersWithAvatars: number;
  usersWithPhone: number;
  recentUsers: User[];
  usersByMonth: Array<{ month: string; count: number }>;
  usersByYear: Array<{ year: number; count: number }>;
}
