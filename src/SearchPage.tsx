import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Autocomplete,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  Grid,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { getBreeds, searchDogs, getDogs, generateMatch, getLocations, Dog, Location } from './api';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState<number | undefined>();
  const [ageMax, setAgeMax] = useState<number | undefined>();
  const [sortField, setSortField] = useState<'breed' | 'name' | 'age'>('breed');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [locationMap, setLocationMap] = useState<Map<string, Location>>(new Map());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
  const [searchResult, setSearchResult] = useState<{
    resultIds: string[];
    total: number;
    next?: string;
    prev?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const breeds = await getBreeds();
        setBreeds(breeds);
      } catch (error) {
        console.error('Failed to fetch breeds:', error);
      }
    };
    fetchBreeds();
  }, []);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const result = await searchDogs(query);
      setSearchResult(result);

      const dogData = await getDogs(result.resultIds);
      setDogs(dogData);

      const zipCodes = dogData.map((dog) => dog.zip_code);
      const locations = await getLocations(zipCodes);
      const zipMap = new Map(locations.map((loc) => [loc.zip_code, loc]));
      setLocationMap(zipMap);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Search Dogs
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button variant="contained" onClick={() => performSearch('')}>Search</Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchPage;
