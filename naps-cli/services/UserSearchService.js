/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import axios from 'axios';

import JwtTokenService from './JwtTokenService';
import { BASE_URL } from '../config.js';
import UserSearchScheme from '../schemas/user/UserSearchScheme.js';

class UserSearchService {
  constructor() {
    this.baseUrl = `${BASE_URL}/users`;
    this.jwtService = new JwtTokenService();
  }

  async request(method, url, data = null, config = {}) {
    let token = await this.jwtService.getToken();

    if (!token) {
      throw new Error("No authentication token found");
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        ...(config.headers || {})
      };

      const response = await axios({
        method,
        url: this.baseUrl + url,
        data,
        params: config.params || {},
        headers,
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        try {
          token = await this.jwtService.refreshToken();
          const headers = {
            Authorization: `Bearer ${token}`,
            ...(config.headers || {})
          };

          const response = await axios({
            method,
            url: this.baseUrl + url,
            data,
            params: config.params || {},
            headers,
          });

          return response.data;
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw refreshError;
        }
      }

      console.error(`Request error [${method} ${url}]:`, error);
      throw error;
    }
  }

  async searchUsers(query, limit = 20) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const data = await this.request('get', '/search', null, { 
      params: { query: query.trim(), limit } 
    });
    
    return UserSearchScheme.fromApiArray(data);
  }

  setAuthToken(token) {
    console.warn('setAuthToken is deprecated. Tokens are now managed automatically.');
  }
}

export default UserSearchService;