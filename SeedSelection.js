import { FormControl, InputLabel, Select, MenuItem, Autocomplete, TextField } from '@mui/material'
import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import {debounce} from '../utils/base-utils'
import styled from 'styled-components'

const AlbumOrArtistImage = styled.img`
  height: 100px;
  width: 100px;
  margin-right: 8px;
`;

const SongInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const SeedSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  .MuiFormControl-root {
    margin-bottom: 12px;
  }

  .MuiFormControl-root:first-child {
    margin-top: 8px;
  }
`

function SeedSelection(params) {
  const { setSeedArtist, setSeedGenre, setSeedSong, seedGenre } = params
  const [genres, setGenres] = useState()
  const [seedArtistOptions, setSeedArtistOptions] = useState([])
  const [seedSongOptions, setSeedSongOptions] = useState([])

  const fetchSeedArtists = async (searchTerm) => {
    setSeedArtistOptions([])
    const response = await axios.get(`https://suggestr-backend.herokuapp.com/artists?query=${searchTerm}`)
    setSeedArtistOptions(response?.data?.artists?.items)
  }

  useEffect(() => {
    const fetchGenres = async () => {
      const response = await axios.get('https://suggestr-backend.herokuapp.com/genres')
      setGenres(response.data.genres)
    }
    if (!genres) {
      fetchGenres()
    }
  }, [])

  const fetchSeedSongs = async (searchTerm) => {
    setSeedSongOptions([])
    const response = await axios.get(`https://suggestr-backend.herokuapp.com/songs?query=${searchTerm}`)
    setSeedSongOptions(response?.data?.tracks?.items)
  }

  const debounceFetchingArtists = useCallback(
    debounce(fetchSeedArtists, 300)
    , [])

  const debounceFetchingSongs = useCallback(
    debounce(fetchSeedSongs, 300)
    , [])

  const handleSeedSongChange = (event, value) => {
    setSeedSong(value)
    if (!value) {
      setSeedSongOptions([])
    }
  }
  const handleSeedArtistChange = (event, value) => {
    setSeedArtist(value)
    if (!value) {
      setSeedArtistOptions([])
    }
  }
  const handleSeedGenreChange = (event, value) => {
    setSeedGenre(value)
  }

  const handleSeedArtistsOptionsChange = (event) => {
    if (event?.target?.value) {
      debounceFetchingArtists(event?.target?.value)
    }
  }

  const handleSeedSongOptionsChange = (event) => {
    if (event?.target?.value) {
      debounceFetchingSongs(event?.target?.value)
    }
  }

  const songInfoDiv = (props, song) => (
    <div {...props} id={song.id} key={song.id} >
    <AlbumOrArtistImage src={song?.album?.images?.[0]?.url}/>
    <SongInfoContainer>
      <span>"{song.name}"</span>
      <span>{song.artists?.[0]?.name}</span>
      <span>({song.album?.release_date})</span>
    </SongInfoContainer>
  </div>
  )


  return (
    <SeedSelectionContainer className="seed-selection">
      <FormControl>
        <Autocomplete
          size="small"
          noOptionsText="Start searching for song options"
          disablePortal
          filterOptions={(x) => x}
          id="songs-autocomplete"
          onChange={handleSeedSongChange}
          options={seedSongOptions}
          getOptionLabel={(option) => (option ? option.name : "")}
          renderOption={(props, option) => songInfoDiv(props, option)}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField onChange={handleSeedSongOptionsChange} {...params} label="Song" />}
        />
      </FormControl>
      <FormControl>
        <Autocomplete
          size="small"
          noOptionsText="Start searching for artist options"
          disablePortal
          filterOptions={(x) => x}
          id="artists-autocomplete"
          onChange={handleSeedArtistChange}
          options={seedArtistOptions}
          getOptionLabel={(option) => (option ? option.name : "")}
          renderOption={(props, option) => <div {...props} key={option.id} id={option.id}><AlbumOrArtistImage src={option.images?.[0]?.url}/><span>{option.name}</span></div>}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField onChange={handleSeedArtistsOptionsChange} {...params} label="Artist" />}
        />
      </FormControl>
      { genres && <FormControl>
        <Autocomplete
          size="small"
          disablePortal
          id="genres-autocomplete"
          onChange={handleSeedGenreChange}
          options={genres}
          renderOption={(props, option) => <MenuItem {...props} key={option} value={option}>{option}</MenuItem>}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Genre" />}
        />
      </FormControl>}
    </SeedSelectionContainer>
  );
}

export default SeedSelection;
