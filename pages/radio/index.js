import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../supabaseClient';
import styles from './style/RadioList.module.css';
import { FaSearch, FaSpinner, FaBroadcastTower } from 'react-icons/fa';

const RadioList = () => {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all radio stations from the database
  const fetchRadioStations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('radio')
        .select('id, slug, logo_url, radioname, frequency, city, country, status')
        .eq('status', 'online');
  
      if (error) {
        console.error('Error fetching radio stations:', error);
        setLoading(false);
        return;
      }
  
      console.log('Fetched Radio Stations:', data); // Debugging: Check if cities are present
  
      const uniqueCountries = ['All', ...new Set(data.map((station) => station.country))];
  
      setStations(data);
      setFilteredStations(data);
      setCountries(uniqueCountries);

      // Initialize cities for 'All' countries when stations are fetched
      updateCityFilter('All', data);
      setLoading(false);
    } catch (err) {
      console.error('Unexpected error:', err);
      setLoading(false);
    }
  };
  
  // Update cities based on the selected country and available stations
  const updateCityFilter = (country, data = stations) => {
    if (country === 'All') {
      const allCities = ['All', ...new Set(data.map((station) => station.city).filter(city => city))];
      console.log('All Cities:', allCities); // Debugging
      setCities(allCities);
    } else {
      const filteredCities = ['All', ...new Set(data
        .filter((station) => station.country === country)
        .map((station) => station.city)
        .filter(city => city))];
      console.log('Filtered Cities:', filteredCities); // Debugging
      setCities(filteredCities);
    }
  };

  // Handle country filter change
  const handleCountryChange = (event) => {
    const selected = event.target.value;
    setSelectedCountry(selected);
    setSelectedCity('All'); // Reset the city filter when changing the country
    updateCityFilter(selected); // Update the city filter options based on the selected country
    filterStations(selected, 'All', searchQuery);
  };
  
  // Handle city filter change
  const handleCityChange = (event) => {
    const selected = event.target.value;
    setSelectedCity(selected);
    filterStations(selectedCountry, selected, searchQuery);
  };

  // Handle search query change
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    filterStations(selectedCountry, selectedCity, query);
  };

  // Filter stations by country, city, and search query
  const filterStations = (country, city, query) => {
    let filtered = stations;

    if (country !== 'All') {
      filtered = filtered.filter((station) => station.country === country);
    }

    if (city !== 'All') {
      filtered = filtered.filter((station) => station.city === city);
    }

    if (query !== '') {
      filtered = filtered.filter(
        (station) =>
          station.radioname.toLowerCase().includes(query) ||
          station.city.toLowerCase().includes(query) ||
          station.country.toLowerCase().includes(query)
      );
    }

    setFilteredStations(filtered);
  };

  useEffect(() => {
    fetchRadioStations();
  }, []);

  return (
    <div className={styles.radioListContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Explore Online Radio Stations</h1>
        <p className={styles.tagline}>
          Discover and listen to your favorite online radio stations from around the world.
        </p>
      </header>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by station name, city, or country..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      {/* Country and City Filter Dropdowns */}
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="countryFilter">Filter by Country: </label>
          <select
            id="countryFilter"
            value={selectedCountry}
            onChange={handleCountryChange}
            className={styles.countryFilter}
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="cityFilter">Filter by City: </label>
          <select
            id="cityFilter"
            value={selectedCity}
            onChange={handleCityChange}
            className={styles.cityFilter}
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Display Radio Stations */}
      {loading ? (
        <div className={styles.loadingSpinner}>
          <FaSpinner className={styles.spinnerIcon} /> Loading stations...
        </div>
      ) : (
        <div className={styles.stationList}>
          {filteredStations.length > 0 ? (
            filteredStations.map((station) => (
              <Link key={station.slug} href={`/radio/${station.slug}`} passHref>
                <div className={styles.stationCard}>
                  {station.logo_url ? (
                    <img
                      src={station.logo_url}
                      alt={`${station.radioname} Logo`}
                      className={styles.stationLogo}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.noLogo}>
                      <FaBroadcastTower size={40} />
                    </div>
                  )}
                  <div className={styles.stationInfo}>
                    <h2 className={styles.stationName}>{station.radioname}</h2>
                    <p className={styles.frequency}>{station.frequency} MHz</p>
                    <p className={styles.city}>{station.city}, {station.country}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.noStations}>No Online Radio Stations Found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RadioList;