import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from "react";

var DEV_SERVER = "http://localhost:5001";

const track = {
  name: "",
  album: {
      images: [
          { url: "" }
      ]
  },
  artists: [
      { name: "" }
  ]
}

function SpotifyWebPlayer ({imgUrl, token}) {

  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);

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
              (!state)? setActive(false) : setActive(true) 
          });
      
      }));

    };

}, [token]);

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
        <div className="container">
            <div className="main-wrapper">
                <img src={current_track.album.images[0].url} 
                     className="now-playing__cover" alt="" />

                <div className="now-playing__side">
                    <div className="now-playing__name">{
                                  current_track.name
                                  }</div>

                    <div className="now-playing__artist">{
                                  current_track.artists[0].name
                                  }</div>
                </div>
                <div>
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
        </div>
     </>
  )
}

function Login () {

  return (
    <a
    className='App-login-button'
    href={`${DEV_SERVER}/auth/login`}
    target="_blank"
    rel="noreferrer"
    >Login
    </a>
  )
}

function App() {

  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {

    tokenAuthFlow();

  }, [])

  const tokenAuthFlow = async () => {
    try {
      const response = await fetch(DEV_SERVER + "/auth/token");
      if(!response.ok) {
        throw new Error(`authorization token failed, returned status code ${response.status}`);
      }
      const data = await response.json();
      setAuthToken(data.access_token);
    } catch(err) {
      console.error(err)
    }

  }



  return (
    <div className="SpotifyWebPlayer">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Welcome
        </p>
        { !authToken ? <Login /> : <SpotifyWebPlayer token={authToken}/>}
      </header>
    </div>
  );
}

export default App;
