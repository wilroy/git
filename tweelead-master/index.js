var Twitter = require('twitter');
var AYLIENTextAPI = require("aylien_textapi");
var GoogleSpreadsheet = require("google-spreadsheet");

const GOOGLE_EMAIL        = 'roy.william.wr@gmail.com';
const GOOGLE_PASSWORD     = 'william5*';
const AYLIEN_APP_ID       = '06581a6d';
const AYLIEN_APP_KEY      = 'b05b157a806271c62267ba8e9eb5bfc0';
const TW_CONSUMER_KEY     = ZZDYUyRtSEFedhoQe2tKoeN3E';
const TW_CONSUMER_SEC     = ' 0D0DNMx3HmrQBpSK5r1TYG5cWNI2Q3i0acMlRSP25sa6kN6N35';
const TW_ACCESS_TOKEN_KEY = ' 333863663-2eZCDRhsngj96UgOnfZiV5kzCjBUVsL2EvmFC6p7';
const TW_ACCESS_TOKEN_SEC = 'cIjdUFJJGhzcJeibFrCbHUJBpgNx13MTqJxuf7jxXAjWW';
const CSV_KEYWORDS        = 'coaching,PNL,formation';

var gsheet = new GoogleSpreadsheet('https://drive.google.com/open?id=1uSAC8Bg_8jximDiTLsNYY5YYcd_LJOOvSG7HEu1Lfls&authuser=0');

var textapi = new AYLIENTextAPI({
  application_id: AYLIEN_APP_ID,
  application_key: AYLIEN_APP_KEY
});

var client = new Twitter({
  consumer_key: TW_CONSUMER_KEY,
  consumer_secret: TW_CONSUMER_SEC,
  access_token_key: TW_ACCESS_TOKEN_KEY,
  access_token_secret: TW_ACCESS_TOKEN_SEC
});


client.stream('statuses/filter', {track: CSV_KEYWORDS}, function(stream) {
  stream.on('data', function(tweet) {
    textapi.sentiment({"text": tweet.text}, function(error, response) {
      if (error === null && (response.polarity == 'negative' || (response.polarity == 'neutral' && response.polarity_confidence <= 0.65))) {
        console.log(tweet.text);
        console.log("https://twitter.com/" + tweet.user.screen_name + '/status/' + tweet.id_str);
        console.log("Polarity confidence: " + Math.round(response.polarity_confidence*100)/100);
        gsheet.setAuth(GOOGLE_EMAIL, GOOGLE_PASSWORD, function(err){
          if (err) {
            console.log(err);
            return;
          }
          gsheet.addRow(1, { text: tweet.text, url: "https://twitter.com/" + tweet.user.screen_name + '/status/' + tweet.id_str, polarity: response.polarity, confidence: Math.round(response.polarity_confidence*100)/100}, function(err) {console.log(err);} );
        });
      }
    });
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});

