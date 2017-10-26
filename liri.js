// Modules

var fs = require("fs");
var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var weather = require("weather-js");
var inquire = require("inquirer");
const chalk = require("chalk");

// Init Variables

var input = process.argv;
var action = input[2];
var value = input[3];
var feed = new Twitter(keys.twitterKeys);
var userTwitter = "dummy_mcdummy";
var spotify = new Spotify(keys.spotifyKeys);
for (var i = 3; i === input.length; i++) {
  value = value + " " + input[i];
}

// Commands

switch(action){
  case "get-tweets":
    getTweets();
    break;
  case "get-song":
  case "spotify-this":
    getSong(value);
    break;
  case "omdb-this":
  case "omdb":
  case "movie-this":
    getMovie(value);
    break;
  case "random":
  case "random-this":
  case "do-what-it-says":
    random();
    break;
  case "weather":
  case "weather-this":
  case "get-weather":
    getWeather(value);
    break;
  case "set-timer-for":
  case "count-to":
    countTo(value);
    break;
  case "help":
    help();
    break;
  case "about":
    about();
    break;
  case "prompt":
    prompt();
    break;
  case "setup":
    setup();
    break;
} // end commands


// Functions
function help(){
  console.log(
`
${chalk.white("Welcome to Liri-Bot * This is the online help utility * Version 0.9")}
${chalk.red("===================================================================================================")}
Help is available for the topics listed below.
Additional help for built-in functions and operators is
available in the online version of the manual. 
${chalk.white("Type <help> to see this list")}

LIRI is similar to SIRI in the fact that it can find out information for you. You can check songs, 
movies, define words, check the weather, and check your twitter feed. I will be adding more skills 
later on. But enjoy your experience with LIRI.

Commands:
${chalk.red("===================================================================================================")}

1) node liri.js <ACTION> <ARGUMENTS>

The <ACTION> represents the main task and the <ARGUMENTS> are the parameters for that action. 

2) node liri.js prompt
3) node liri.js my-tweets
4) node liri.js spotify-this-song <ARGUMENTS>
5) node liri.js movie-this <ARGUMENTS>
6) node liri.js get-weather <ARGUMENTS>
7) node liri.js count-to <ARGUMENTS>
8) node liri.js do-what-it-says

IMPORTANT ---- If you pass in an any arguments that have multple words (eg. Bad Blood or Shawshank 
Redemption) surround them with quotations (eg. "Bad Blood" or "Shawshank Redemption"). Otherwise
on the first word will be searched (eg. Bad or Shawshank)



Examples:

node liri.js get-tweets
  This will return your last 20 tweets that you have tweeted.

node liri.js spotify-this-song "Galway Girl"
  This will return the song titled Galway Girl and will also give the artist, album, and a URL that
  will give you a 30 second preview of the song.

node liri.js movie-this Cinderella
  This will return a movie with the title Cinderella and give you a quick synopsis of the movie and 
  a link where there to find out more information about the movie.
`); // end template string
} // end help()

function about(){
  console.log(
`
${chalk.blue.bold("* Welcome to LIRI BOT *")} 
${chalk.blue("Version Beta.05")}
${chalk.blue("by Julian Hasse")}


${chalk.yellow(" $$ |      $$$$$$| $$$$$$$|  $$$$$$|       $$$$$$$|   $$$$$$| $$$$$$$$|  ")}
${chalk.yellow(" $$ |      |_$$  _|$$  __$$| |_$$  _|      $$  __$$| $$  __$$||__$$  __| ")}
${chalk.yellow(" $$ |        $$ |  $$ |  $$ |  $$ |        $$ |  $$ |$$ /  $$ |  $$ |    ")}
${chalk.yellow(" $$ |        $$ |  $$$$$$$  |  $$ |        $$$$$$$| |$$ |  $$ |  $$ |    ")}
${chalk.yellow(" $$ |        $$ |  $$  __$$<   $$ |        $$  __$$| $$ |  $$ |  $$ |    ")}
${chalk.yellow(" $$ |        $$ |  $$ |  $$ |  $$ |        $$ |  $$ |$$ |  $$ |  $$ |    ")}
${chalk.yellow(" $$$$$$$$| $$$$$$| $$ |  $$ |$$$$$$|       $$$$$$$  | $$$$$$  |  $$ |    ")}
${chalk.yellow(" |________||______||__|  |__||______|      |_______/  |______/   |__|    ")}


`); // end template string
} // end about()

function log(input){
  console.log(chalk.green(input));
  fs.appendFile("log.txt",(input + `\n`));
} //end log()

function getTweets(){
  fs.appendFile("log.txt", ("-------- Log Entry --------\n" + Date() + "\n" + "User used getTweets()\n"));
  feed.get('statuses/user_timeline', userTwitter, function(err, tweets,response){
    if(err){
      return log(err);
    }// end if()

    if(response.statusCode === 200) {
      for(i = 0; i < tweets.length; i++){
        var counter = i + 1;
        var text = tweets[i].text;
        var time = tweets[i].created_at;
        log(`Tweet ${counter}: At ${time} you tweeted "${text}"`)
      } // end for()
    } // end if
  }); //end feed
} //end getTweets()

function getSong(input){
  fs.appendFile("log.txt", ("-------- Log Entry --------\n" + Date() + "\n" + "User used getSong()\n"));
  var valType = "track";
  var song = input;

  if(input == null || input === "undefined" || input === "undefined undefined") {
    song = "The Sign";
  }

  spotify.search({ type:valType, query:song}, function(err, data){
    if (err){
      log("Error Occurred: " + err);
    } else {
      var response = data.tracks.items[0];
      var artist = response.artists[0].name;
      var title = response.name;
      var album = response.album.name;
      var url = response.preview_url;
      log(`You searched Spotify for: ${song}
---As I scoured the intrawebs, here is what I found---
The song ${song} was performed by ${artist}.
${artist} released this song on the album "${album}".
You can listen to ${song} here - ${url}`);
    }
  }); // end spotify.search()
} // end spotifySong()

function getMovie(input){
  fs.appendFile("log.txt", ("-------- Log Entry --------\n" + Date() + "\n" + "User used getMovie()\n"));
  var movie = input;
  if(movie === undefined){
    movie = "Mr. Nobody";
  }
  request(`http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=40e9cece`, function(err, response, body) {
    if (!err && response.statusCode === 200) {
      var data = JSON.parse(body);
      var title = data.Title;
      var year = data.Year;
      var rated = data.Rated;
      var ratingLength = data.Ratings.length;
      console.log(ratingLength);
      if(ratingLength === 0){
        var imdbRating = "Sorry this movie is yet to be rated."
      } else{
        var imdbRating = data.Ratings[0].Value;
      }
      if(ratingLength > 1){
        var rottenRating = data.Ratings[1].Value;
      } else {
        var rottenRating = "We were too lazy to even watch this movie.";
      }
      var country = data.Country;
      var language = data.Language;
      var plot = data.Plot;
      var actors = data.Actors;
      var url = data.Website;
      log(`You have searched for ${movie} and here is what I have found:
${title} (${rated}) was released in ${year}.
This movie was released in ${country} in ${language} and featured ${actors}.
A quick plot of the film is:
  ${plot}

Critic Ratings for ${title}:
  IMDB: ${imdbRating}
  Rotten Tomatoes: ${rottenRating}

To learn more about this film you can visit 
  ${url}`);
    } // end if()
  }); // end request()
} // end getMovie()

function getWeather(input){
  fs.appendFile("log.txt", ("-------- Log Entry --------\n" + Date() + "\n" + "User used getWeather() searching " + input + "\n"));
  var city = input;
  weather.find({search: input, degreeType: "F"}, function(err, result){
    if(err){
      console.log(err);
    } else {
      var pretty = JSON.stringify(result, null, 2);
      var data = result[0].current;
      var temp = data.temperature;
      var time = data.observationtime;
      var city = data.observationpoint;
      var wind = data.winddisplay;
      var humidity = data.humidity;
      log(`If I am wrong dont blame me, I have a guy and weather.service.msn.com. You may have heard of him, his name is Ehpeaeye.
  Anyways, he told me that in ${city}, they checked the weather there at ${time} their time and here is what they got.
    The current weather is :
         Temperature: ${temp}
            Humidity: ${humidity}
        Current Wind: ${wind}`)
    }// end if()
  }); // end weather.find()
} // end getWeather()

function random(){
  fs.readFile("random.txt", "utf8", function(err, data){
    if(err){
      log(err);
    } else{
      var dataArr = data.split(",");
      var numRandom = Math.floor(Math.random() * dataArr.length);
      var keyCheck;
      var keyRandom;
      if(numRandom % 2 === 0){
        keyCheck = true;
        keyRandom = numRandom;
      } else {
        keyCheck = false;
        keyRandom = numRandom - 1;
      } // end if/else()
      var valToKey = keyRandom + 1;
      // Determine which function this random action wants to run, and then run the respective value
      if(dataArr[keyRandom] === "spotify-this-song"){
        getSong(dataArr[valToKey]);
      } else if(dataArr[keyRandom] === "movie-this"){
        getMovie(dataArr[valToKey]);
      } else if(dataArr[keyRandom] === "weather-this"){
        getWeather(dataArr[valToKey]);
      } // end if/else()
    } // end if/else()
  }) // end fs.readFile
} // end random()

function countTo(input){
  fs.appendFile("log.txt", ("-------- Log Entry --------\n" + Date() + "\n" + "User used countTo() to count up to " + input + "\nHere I go..."));
  var target = parseInt(input);
  if(target > 0){
    for(i=0; i<target; i++){
      console.log((i+1));
    } // end for()
    var balance = target * 0.01;
    log(`For my awesome math skills, you now owe me a penny for each count. You think programming me was cheap?
  Let's see here... 
  Since I did ${target} calculations, you now owe me $${balance}.
  I have not been integrated with a credit card machine, Apple Pay, Google Pay, or Venmo API's yet, so I only accept cash.
  Sorry for the inconvenience.`)
  } else {
    log("Please enter a number above 0!")
  } // if if/else()
} // end count

function setup(){
  console.log("This one is still a work in progress");
}

function prompt(){
  inquire
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: ["Look at my tweets", "Check weather somewhere", "Count up to", "Check info on a song", "Check info on a movie"],
        name: "choice"
      } // end questions
    ]) // end inquire.prompt()
    .then(function(response){
      var rc = response.choice;
      if(rc === "Look at my tweets"){
        getTweets();
      }else if(rc === "Check weather somewhere"){
        console.log("look at weather.");
        inquire
          .prompt([
            {
              type: "input",
              message: "Where would you like to search the weather?",
              name: "search"
            } // end questions()
          ]) // end inquire.prompt()
          .then(function(response){
            var search = response.search;
            getWeather(search);
          }); // end .then()
      }else if(rc === "Count up to"){
        inquire
          .prompt([
            {
              type: "input",
              message: "How high should I count?",
              name: "count"
            } // end questions()
          ]) // end inquire.prompt{}
          .then(function(response){
            var count = response.count;
            countTo(count);
          }); // end .then()
      }else if(rc === "Check info on a song"){
        inquire
          .prompt([
            {
              type: "input",
              message: "What song should we look up?",
              name: "song"
            } // end questions{}
          ]) // end inquire.prompt()
          .then(function(response){
            var song = response.song;
            getSong(song);
          }) // end .then
      } else if(rc === "Check info on a movie"){
        inquire
          .prompt([
            {
              type: "input",
              message: "What movie should we look up?",
              name: "movie"
            } // end questions()
          ]) // end inquire.prompt()
          .then(function(response){
            var movie = response.movie;
            getMovie(movie);
          }) // end inquire.prompt()
      } else {
        console.log("I should add this to the the function.")
      } // end if/else()
    }) // end then()
} // end prompt()