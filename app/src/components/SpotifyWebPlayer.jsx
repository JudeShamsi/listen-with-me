import { useEffect, useState, useCallback } from "react";
import './styles/SpotifyWebPlayer.css';

const sampleSrc = "https://f4.bcbits.com/img/a3493924304_16.jpg";
const sampleName = "gunk";
const sampleArtist = "Overmono"

const track = {
  id: '', // Spotify ID for the track
  uri: '', // Spotify URI for the track
  name: sampleName,
  duration_ms: 237040, // integer duration of track in ms
  is_playable: true, //  
  album: {
      images: [
          { url: sampleSrc }
      ]
  },
  artists: [
      { name: sampleArtist }
  ]
}

const audio = {
  id: '',
  acousticness: 0.0,
  analysis_url: '',
  duration_ms: 0, // integer duration of track in ms
  danceability: 0.0, // number [float] Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.
  energy: 0.0, // number [float] Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy
  key: 0, // integer uses Pitch Class notation (C0, C1, C-1) E.g. 0 = C, 1 = C♯/D♭, 2 = D, and so on. If no key was detected, the value is -1. Range is -1, 11 
  valence: 0.0, // number [float] A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).
  tempo: 0, // number [float] BPM,
  liveness: 0.0,
  loudness: 0.0,
  mode: 0,
  speechiness: 0.0,  
  
}


export const SpotifyWebPlayer = ({server, token}) => {

  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);
  const [audio_info, setAudioInfo] = useState(audio)

  useEffect(() => {

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {

        const player = new window.Spotify.Player({
            name: 'Web Playback SDK',
            getOAuthToken: cb => { cb(token); },
            volume: 0.5
        });

        setPlayer(player);

        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
        });

        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        player.connect();

        player.addListener('player_state_changed', ( state => {

          if (!state) {
            return;
          }
      
          setTrack(state.track_window.current_track);
          setPaused(state.paused);
                
          player.getCurrentState().then( state => { 
              (!state)? setActive(false) : setActive(true);
          });
      
      }));

    };

}, [token]);

const getAudioFeatures = useCallback(async () => {
    const url = `https://api.spotify.com/v1/audio-features/${current_track.id}`;
    try {
        const response = await fetch(url, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(
            `There was an error requesting the audio features for track_id ${current_track.id}. Returned status code ${response.status}`
            );
        }

        const data = await response.json();
        setAudioInfo(data);
    } catch (err) {
        console.error(err);
    }
}, [current_track.id, token]);
  
  // Trigger getAudioFeatures when current_track changes and has a valid ID
  useEffect(() => {
    if (current_track && current_track.id) {
      getAudioFeatures();
    }
  }, [current_track, getAudioFeatures]);

  const handlePlay = () => {
      if(player) {
        player.togglePlay();
        setPaused(!is_paused);
      } else {
        console.error("player not available")
      }
  }

  return (
    <>
        <div className="main-webplayer-container">
              <div className="main-img-container">
              <img src={current_track.album.images[0].url} 
                     className="now-playing__cover" alt="now-playing__cover" />
              </div>
                <div className="main-info-container">
                    <div className="now-playing__name">{
                                  current_track.name
                                  }</div>

                    <div className="now-playing__artist">{
                                  current_track.artists[0].name
                                  }</div>
                </div>
                <div className="main-button-container">
                <button className="btn-spotify" onClick={() => { player?.previousTrack() }} >
                      &lt;&lt;
                </button>

                <button className="btn-spotify" onClick={handlePlay} >
                    { is_paused ? "PLAY" : "PAUSE" }
                </button>

                <button className="btn-spotify" onClick={() => { player?.nextTrack() }} >
                      &gt;&gt;
                </button>
                </div>
        </div>
     </>
  )
}