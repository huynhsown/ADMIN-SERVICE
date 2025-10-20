const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3011';

// Login middleware - call auth-service
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Call auth-service login endpoint
    console.log('Calling auth-service...');
    const authResponse = await axios.post(`${AUTH_SERVICE_URL}/auth/login`, {
      email: email, // Auth service expects 'email' field
      password
    });
    console.log('Auth service response received');

    const { accessToken, refreshToken } = authResponse.data;

    // Verify token to get user info and check roles
    const verifyResponse = await axios.post(`${AUTH_SERVICE_URL}/auth/verify-token`, {
      token: accessToken
    });

    const userInfo = verifyResponse.data;
    
    // Check if user has admin or user role (temporary for testing)
    if (!userInfo.smeBeRoles || (!userInfo.smeBeRoles.includes('admin') && !userInfo.smeBeRoles.includes('user'))) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({
      message: 'Login successful',
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        username: userInfo.username,
        name: userInfo.name,
        roles: userInfo.smeBeRoles
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.response) {
      // Auth service error
      const status = error.response.status;
      const message = error.response.data?.error || error.response.data?.message || 'Authentication failed';
      
      if (status === 401) {
        return res.status(401).json({ error: 'Invalid credentials' });
      } else if (status === 403) {
        return res.status(403).json({ error: 'Admin access required' });
      } else {
        return res.status(status).json({ error: message });
      }
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify token middleware - call auth-service
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Call auth-service to verify token
    const verifyResponse = await axios.post(`${AUTH_SERVICE_URL}/auth/verify-token`, {
      token: token
    });

    const userInfo = verifyResponse.data;
    
    // Check if user has admin or user role (temporary for testing)
    if (!userInfo.smeBeRoles || (!userInfo.smeBeRoles.includes('admin') && !userInfo.smeBeRoles.includes('user'))) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Set user info in request
    req.user = {
      username: userInfo.username,
      name: userInfo.name,
      roles: userInfo.smeBeRoles,
      sub: userInfo.sub,
      active: userInfo.active
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error || error.response.data?.message || 'Token verification failed';
      
      if (status === 401) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      } else if (status === 403) {
        return res.status(403).json({ error: 'Admin access required' });
      } else {
        return res.status(status).json({ error: message });
      }
    }
    
    return res.status(500).json({ error: 'Token verification failed' });
  }
};

// Admin role check middleware (redundant since verifyToken already checks this)
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.roles || !req.user.roles.includes('admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  login,
  verifyToken,
  requireAdmin
};
