require("dotenv").config();
const { google } = require("googleapis");

const { initialize } = require("./initialize");

const {
  CLIENT_ID,
  CLIENT_SECRET,
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  EXPIRY_DATE,
} = process.env;

const token = {
  access_token: ACCESS_TOKEN,
  refresh_token: REFRESH_TOKEN,
  scope: "https://www.googleapis.com/auth/spreadsheets",
  token_type: "Bearer",
  expiry_date: Number(EXPIRY_DATE),
};

const initializeAuth = () => {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    "urn:ietf:wg:oauth:2.0:oob"
  );

  oAuth2Client.setCredentials(token);
  initialize(oAuth2Client);
};

exports.initializeAuth = initializeAuth;
