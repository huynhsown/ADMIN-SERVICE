const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3011';

class RoleManagementService {
  // Get user roles from auth-service
  async getUserRoles(userId) {
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/auth/user/${userId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error getting user roles:', error);
      if (error.response && error.response.status === 404) {
        throw new Error('User not found');
      }
      throw error;
    }
  }

  // Assign role to user
  async assignRoleToUser(userId, role) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/auth/assign-role`, {
        userId,
        role
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  // Remove role from user
  async removeRoleFromUser(userId, role) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/auth/remove-role`, {
        userId,
        role
      });
      return response.data;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  }

  // Get all available roles
  async getAvailableRoles() {
    try {
      // Chỉ có 2 roles: ADMIN và USER
      return [
        { name: 'ADMIN', description: 'Administrator' },
        { name: 'USER', description: 'Regular user' }
      ];
    } catch (error) {
      console.error('Error getting available roles:', error);
      throw error;
    }
  }

  // Get role statistics
  async getRoleStatistics() {
    try {
      // This would typically aggregate role data from the database
      // For now, return mock data
      return {
        totalUsers: 0,
        usersByRole: {
          ADMIN: 0,
          USER: 0
        },
        recentRoleChanges: []
      };
    } catch (error) {
      console.error('Error getting role statistics:', error);
      throw error;
    }
  }

  // Activate user
  async activateUser(userId) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/auth/activate-user`, {
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  // Deactivate user
  async deactivateUser(userId) {
    try {
      const response = await axios.post(`${AUTH_SERVICE_URL}/auth/deactivate-user`, {
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Get user status
  async getUserStatus(userId) {
    try {
      const response = await axios.get(`${AUTH_SERVICE_URL}/auth/user/${userId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting user status:', error);
      if (error.response && error.response.status === 404) {
        throw new Error('User not found');
      }
      throw error;
    }
  }
}

module.exports = new RoleManagementService();
