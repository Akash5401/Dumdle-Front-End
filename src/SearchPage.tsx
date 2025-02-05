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
    if (!result) return;
    
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

  const handleSearch = () => {
    const params = new URLSearchParams();
    selectedBreeds.forEach((breed) => params.append('breeds', breed));
    if (ageMin) params.append('ageMin', ageMin.toString());
    if (ageMax) params.append('ageMax', ageMax.toString());
    params.append('sort', `${sortField}:${sortDirection}`);
    params.append('size', '25');
    params.append('from', '0');

    performSearch(params.toString());
  };

  const handlePageChange = (query: string | undefined) => {
    if (query) {
      performSearch(query);
    }
  };

  const toggleFavorite = (dogId: string) => {
    setFavorites((prev) =>
      prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId]
    );
  };

  const handleMatch = async () => {
    try {
      const match = await generateMatch(favorites);
      const [matchedDog] = await getDogs([match.match]);
      setMatchedDog(matchedDog);
    } catch (error) {
      console.error('Failed to generate match:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('https://frontend-take-home-service.fetch.com/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Container>
      <Button onClick={handleLogout} style={{ position: 'absolute', top: 16, right: 16 }}>
        Logout
      </Button>
      <Typography variant="h4" gutterBottom>
        Search Dogs
      </Typography>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Autocomplete
            multiple
            options={breeds}
            value={selectedBreeds}
            onChange={(_, newValue) => setSelectedBreeds(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Breeds" placeholder="Select breeds" />
            )}
          />
        </Grid>
        
        <Grid item xs={6} sm={3}>
  <TextField
    label="Min Age"
    type="number"
    fullWidth
    value={ageMin || ''}
    onChange={(e) => {
      const value = parseInt(e.target.value) || undefined;
      if (value !== undefined && (value < 1 || value > 25)) return; // Restrict range
      setAgeMin(value);
    }}
    inputProps={{ min: 1, max: 25 }}
  />
</Grid>

<Grid item xs={6} sm={3}>
  <TextField
    label="Max Age"
    type="number"
    fullWidth
    value={ageMax || ''}
    onChange={(e) => {
      const value = parseInt(e.target.value) || undefined;
      if (value !== undefined && (value < 1 || value > 25)) return; // Restrict range
      setAgeMax(value);
    }}
    inputProps={{ min: 1, max: 25 }}
  />
</Grid>

        
        <Grid item xs={6} sm={3}>
          <Select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            fullWidth
          >
            <MenuItem value="breed">Breed</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="age">Age</MenuItem>
          </Select>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as any)}
            fullWidth
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </Grid>
        
        <Grid item xs={12}>
          <Button variant="contained" onClick={handleSearch} disabled={isLoading}>
            Search
          </Button>
        </Grid>
      </Grid>

      {isLoading && <CircularProgress style={{ margin: 20 }} />}

      <Grid container spacing={2} style={{ marginTop: 16 }}>
        {dogs.map((dog) => (
          <Grid item xs={12} sm={6} md={4} key={dog.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={dog.img}
                alt={dog.name}
              />
              <CardContent>
                <Typography variant="h6">{dog.name}</Typography>
                <Typography>Age: {dog.age}</Typography>
                <Typography>Breed: {dog.breed}</Typography>
                <Typography>
                  Location: {locationMap.get(dog.zip_code)?.city}, {locationMap.get(dog.zip_code)?.state}
                </Typography>
                <Button
                  onClick={() => toggleFavorite(dog.id)}
                  color={favorites.includes(dog.id) ? 'secondary' : 'primary'}
                >
                  {favorites.includes(dog.id) ? 'Unfavorite' : 'Favorite'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <div style={{ margin: '20px 0' }}>
        <Button
          disabled={!searchResult?.prev}
          onClick={() => handlePageChange(searchResult?.prev)}
        >
          Previous
        </Button>
        <Button
          disabled={!searchResult?.next}
          onClick={() => handlePageChange(searchResult?.next)}
        >
          Next
        </Button>
      </div>

      <div style={{ margin: '20px 0' }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleMatch}
          disabled={favorites.length === 0}
        >
          Generate Match from {favorites.length} Favorites
        </Button>
      </div>

      <Dialog open={!!matchedDog} onClose={() => setMatchedDog(null)}>
        <DialogTitle>Your Perfect Match!</DialogTitle>
        <DialogContent>
          {matchedDog && (
            <>
              <CardMedia
                component="img"
                image={matchedDog.img}
                alt={matchedDog.name}
                style={{ maxWidth: '100%' }}
              />
              <Typography>Name: {matchedDog.name}</Typography>
              <Typography>Age: {matchedDog.age}</Typography>
              <Typography>Breed: {matchedDog.breed}</Typography>
              <Typography>
                Location: {locationMap.get(matchedDog.zip_code)?.city}, {locationMap.get(matchedDog.zip_code)?.state}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMatchedDog(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SearchPage;