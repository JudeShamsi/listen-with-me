const express = require("express");
const dotenv = require("dotenv");
const generateRandomState = require("./utils").default;

const port = 5001;

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

var app = express();

app.get('/auth/login', (req, res) => {
    let scope = "streaming \
                    user-read-email \
                        user-read-private"

    let state = generateRandomState(16);

    let auth_query_params = new URLSearchParams({
        response_type: "code",
        client_id: spotify_client_id,
        scope: scope,
        redirect_uri: "http://localhost:3000/auth/callback",
        state: state
    })

    res.redirect("https://accounts.spotify.com/authorize/?" + auth_query_params)
});

app.get('/auth/callback', (req, res) => {

    var code = req.query.code;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: "http://localhost:3000/auth/callback",
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64')),
          'Content-Type' : 'application/x-www-form-urlencoded'
        },
        json: true
      };

      request.post(authOptions, function(err, response, body) {
        if(!err && response.statusCode === 200) {
            var access_token = body.access_token;
            res.redirect('/');
        }
      })

});

app.get("/auth/token", (req, res) => {
    res.json({
        access_token: access_token
    })
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})

