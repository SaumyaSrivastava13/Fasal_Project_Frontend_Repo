import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './styles.module.css';

const Home = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [error, setError] = useState(null);

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(`https://fasalprojectbackendrepo-production.up.railway.app/api/playlist?uid=${localStorage.getItem("uid")}`);
      setPlaylists(response.data.playlists);
      setError(null); // Reset error state on successful fetch
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setError('Failed to fetch playlists. Please try again later.');
    }
  };

  const fetchMoviesForPlaylist = async (puid) => {
    try {
      const response = await axios.get(`https://fasalprojectbackendrepo-production.up.railway.app/api/movieplay/${puid}`);
      const imdbIDs = response.data.movies;
      if (imdbIDs && imdbIDs.length > 0) {
        const moviePromises = imdbIDs.map(imdb =>
          axios.get(`https://www.omdbapi.com/?i=${imdb.imdbID}&apikey=463854ee`)
        );
        const movieResponses = await Promise.all(moviePromises);
        const moviesData = movieResponses.map(res => res.data);
        setSelectedPlaylist(moviesData);
      } else {
        setSelectedPlaylist([]); // Handle empty or undefined imdbIDs
      }
    } catch (error) {
      console.error('Error fetching movies for playlist:', error);
      setError('Failed to fetch movies for playlist. Please try again later.');
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handlePlaylistClick = (puid) => {
    fetchMoviesForPlaylist(puid);
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.headingBlock}>
        <h1 className={styles.heading}>Your Playlists</h1>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.playlistsGrid}>
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <div className={styles.playlistCard} key={playlist.puid} onClick={() => handlePlaylistClick(playlist.puid)}>
              <div className={styles.playlistInfo}>
                <h2 className={styles.playlistTitle}>{playlist.name}</h2>
                <p className={styles.playlistDescription}>{playlist.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noPlaylists}>No playlists available</p>
        )}
      </div>
      {selectedPlaylist && selectedPlaylist.length > 0 && (
        <div className={styles.selectedPlaylist}>
          <h2>{selectedPlaylist[0].name}</h2>
          <p>{selectedPlaylist[0].description}</p>
          <div className={styles.moviesGrid}>
            {selectedPlaylist.map((movie) => (
              <div className={styles.movieCard} key={movie.imdbID}>
                <img src={movie.Poster} alt={movie.Title} className={styles.movieImage} />
                <h3 className={styles.movieTitle}>{movie.Title}</h3>
                <p className={styles.movieDescription}>{movie.Plot}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
