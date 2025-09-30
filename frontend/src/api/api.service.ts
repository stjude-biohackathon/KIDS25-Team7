import axios, { AxiosError, type AxiosResponse } from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ApiService = {

  // GET 
  async get<T>(endpoint: string, params = {}): Promise<T> {
    try {
      const response: AxiosResponse = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  },

  // POST
  async post<T>(endpoint: string, data = {}): Promise<T> {
    try {
      const response: AxiosResponse = await apiClient.post(endpoint, { data });
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  },

  // PUT
  async put<T>(endpoint: string, data = {}): Promise<T> {
    try {
      const response: AxiosResponse = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  },

  // DELETE
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response: AxiosResponse = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  },

  handleError(error: AxiosError): never {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      const serverError = error.response.data as any;
      throw new Error(serverError.message || 'Server error occurred');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || 'Request failed');
    }
  }
};