/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { TOKEN_KEY, REFRESH_KEY, BASE_URL } from '../config.js';

export const API_URL = `${BASE_URL}/auth`

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ token: null, authenticated: null });

  const storage = {
    getItem: async (key) => {
      return await SecureStore.getItemAsync(key);
    },
    setItem: async (key, value) => {
      await SecureStore.setItemAsync(key, value);
    },
    removeItem: async (key) => {
      await SecureStore.deleteItemAsync(key);
    },
  };

  useEffect(() => {
    const loadToken = async () => {
      const token = await storage.getItem(TOKEN_KEY);
      setAuthState({ token, authenticated: !!token });
    };
    loadToken();
  }, []);

  const onRegister = async (email) => {
    const formData = new FormData();
    formData.append("email", email);

    return axios.post(`${API_URL}/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const onVerifyEmail = async (email, code) => {
    const formData = new FormData();
    formData.append("code", code);
    return axios.post(`${API_URL}/verify-email?email=${email}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const onSendCode = async (email) => {
      const formData = new FormData();
      formData.append("email", email);
      return axios.post(`${API_URL}/resend-mail`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
      });
  }

  const onCompleteRegistration = async (verified_id, data) => {
    const res = await axios.post(
      `${API_URL}/complete-registration?verified_id=${verified_id}&latitude=${data.latitude}&longitude=${data.longitude}`,
      data
    );

    const { access_token, refresh_token } = res.data;
    await storage.setItem(TOKEN_KEY, access_token);
    await storage.setItem(REFRESH_KEY, refresh_token);
    setAuthState({ token: access_token, authenticated: true });
    return res.data;
  };

  const onLogin = async (login_data, password) => {
    try {
      const formData = new FormData();
      formData.append("login_data", login_data);
      formData.append("password", password);

      const res = await axios.post(`${API_URL}/login`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { access_token, refresh_token } = res.data;
      await storage.setItem(TOKEN_KEY, access_token);
      await storage.setItem(REFRESH_KEY, refresh_token);
      setAuthState({ token: access_token, authenticated: true });
      return res.data;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };


  const onLogout = async () => {
    const token = await storage.getItem(TOKEN_KEY);
    if (token) {
      const formData = new FormData();
      formData.append("token", token);
      await axios.post(`${API_URL}/logout`, formData);
    }
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(REFRESH_KEY);
    setAuthState({ token: null, authenticated: false });
  };

  const onRefresh = async () => {
    const refreshToken = await storage.getItem(REFRESH_KEY);
    if (!refreshToken) return;

    const res = await axios.post(`${API_URL}/refresh`, { refresh_token: refreshToken });
    const { access_token } = res.data;
    await storage.setItem(TOKEN_KEY, access_token);
    setAuthState({ token: access_token, authenticated: true });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        onRegister,
        onVerifyEmail,
        onCompleteRegistration,
        onLogin,
        onLogout,
        onRefresh,
        onSendCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};