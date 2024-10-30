import './App.css';
import { useEffect, useState } from "react";
import { Login } from './components/Login';
import { SpotifyWebPlayer } from './components/SpotifyWebPlayer';
import ThreeJSScene from './components/threeSample';

var DEV_SERVER = "http://localhost:5001";

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
    <div className="App">
      <header className="App-header">
        <p>
          Listen With Me
        </p>
      </header>
      <main className="App-main">
        { !authToken ? <Login server={DEV_SERVER}/> : <SpotifyWebPlayer token={authToken} server={DEV_SERVER}/>}
        {/* <ThreeJSScene /> */}
      </main>
    </div>
  );
}

export default App;
