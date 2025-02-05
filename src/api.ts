import axios from 'axios';

const API_BASE = 'https://frontend-take-home-service.fetch.com';

// Define Dog Type
export interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

// Define Location Type
export interface Location {
  zip_code: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  county: string;
}

// Login API
export const login = async (name: string, email: string): Promise<void> => {
  await axios.post(
    `${API_BASE}/auth/login`,
    { name, email },
    { withCredentials: true }
  );
};

// Logout API
export const logout = async (): Promise<void> => {
  await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
};

// Fetch Breeds
export const getBreeds = async (): Promise<string[]> => {
  const response = await axios.get<string[]>(`${API_BASE}/dogs/breeds`, {
    withCredentials: true,
  });
  return response.data;
};

// Search Dogs with Filters
export const searchDogs = async (query: string): Promise<{ resultIds: string[]; total: number; next?: string; prev?: string }> => {
  const response = await axios.get<{ resultIds: string[]; total: number; next?: string; prev?: string }>(
    `${API_BASE}/dogs/search?${query}`,
    { withCredentials: true }
  );
  return response.data;
};

// Fetch Dog Details by ID
export const getDogs = async (ids: string[]): Promise<Dog[]> => {
  const response = await axios.post<Dog[]>(`${API_BASE}/dogs`, ids, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

// Fetch Location Details by Zip Code
export const getLocations = async (zipCodes: string[]): Promise<Location[]> => {
  if (zipCodes.length === 0) return [];

  const response = await axios.post<Location[]>(`${API_BASE}/locations`, zipCodes, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

// Search Locations (City-Based Search)
export const searchLocations = async (query: { city?: string; states?: string[] }): Promise<{ results: Location[]; total: number }> => {
  const response = await axios.post<{ results: Location[]; total: number }>(
    `${API_BASE}/locations/search`,
    query,
    {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
};

// Fetch Zip Code Suggestions (City-Based)
export const fetchZipCodeSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];

  try {
    const locationQuery = { city: query, size: 10 };
    const { results } = await searchLocations(locationQuery);
    return results.map((loc) => loc.zip_code);
  } catch (error) {
    console.error('Zip code search failed:', error);
    return [];
  }
};

// Match a Dog from Favorites
export const generateMatch = async (favorites: string[]): Promise<{ match: string }> => {
  const response = await axios.post<{ match: string }>(
    `${API_BASE}/dogs/match`,
    favorites,
    {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return response.data;
};
