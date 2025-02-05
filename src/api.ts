// src/api.ts
import axios from 'axios';

const API_BASE = 'https://frontend-take-home-service.fetch.com';

export interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export interface Location {
  zip_code: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  county: string;
}

export interface Match {
  match: string;
}

// Auth functions
export const login = async (name: string, email: string) => {
  await axios.post(`${API_BASE}/auth/login`, { name, email }, { 
    withCredentials: true 
  });
};

// Dog functions
export const getBreeds = async (): Promise<string[]> => {
  const response = await axios.get<string[]>(`${API_BASE}/dogs/breeds`, { 
    withCredentials: true 
  });
  return response.data;
};

export const searchDogs = async (query: string) => {
  const response = await axios.get<{
    resultIds: string[];
    total: number;
    next?: string;
    prev?: string;
  }>(`${API_BASE}/dogs/search?${query}`, { 
    withCredentials: true 
  });
  return response.data;
};

export const getDogs = async (ids: string[]): Promise<Dog[]> => {
  const response = await axios.post<Dog[]>(`${API_BASE}/dogs`, ids, { 
    withCredentials: true 
  });
  return response.data;
};

export const generateMatch = async (ids: string[]): Promise<Match> => {
  const response = await axios.post<Match>(`${API_BASE}/dogs/match`, ids, { 
    withCredentials: true 
  });
  return response.data;
};

// Location functions
export const getLocations = async (zipCodes: string[]): Promise<Location[]> => {
  const response = await axios.post<Location[]>(`${API_BASE}/locations`, zipCodes, { 
    withCredentials: true 
  });
  return response.data;
};