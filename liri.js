// Modules
const fs = require("fs");
const keys = require("./keys.js");
const Twitter = require("twitter");
const Spotify = require("node-spotify-api");
const request = require("request");
const weather = require("weather-js");
const inquire = require("inquirer");
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
  case "twitter":
  case "myTweets":
  case "--t":
    getTweets();
    break;
  case "get-song":
  case "spotify-this":
  case "spotify":
  case "--s":
    getSong(value);
    break;
  case "get-movie":
  case "omdb":
  case "movie-this":
  case "--mv":
    getMovie(value);
    break;
  case "random":
  case "random-this":
  case "do-what-it-says":
  case "--r":
    random();
    break;
  case "weather":
  case "weather-this":
  case "get-weather":
  case "--w":
    getWeather(value);
    break;
  case "set-timer":
  case "--st":
    setTimer(value);
    break;
  case "help":
  case "--h":
    help();
    break;
  case "about":
  case "--a":
    about();
    break;
  case "prompt":
  case "menu":
  case "options":
  case "--m":
    menu();
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
${chalk.white("Type <node liri help> to see this list")}

LIRI-BOT is an "intelligent assistant" that enables users to enter natural language 
commands in order to perform several tasks including: spotify's song info, omdb's movies data, 
check the weather, set a timer and retrieve your twitter feed.


${chalk.white("Commands:")}
${chalk.red("===================================================================================================")}

1) node liri <ACTION> <ARGUMENTS> ${chalk.red("// <ACTION> is the main task, <ARGUMENTS> are the parameters for that action.")} 
2) node liri menu ${chalk.red(" // you can also use (options | prompt | --m)")}
3) node liri get-tweets ${chalk.red(" // you can also use (twitter | myTweets | --t)")}
4) node liri get-song ${chalk.red("// <title> you can also use (spotify-this | spotify | --s)")}
5) node liri get-movie ${chalk.red("// <title | more than 2 words surrounded with quotations, eg. 'Star Wars'>")}
6) node liri get-weather <ARGUMENTS> ${chalk.red("// <City | more than 2 words surrounded with quotations, eg. 'Austin TX'>")}
7) node liri set-timer <ARGUMENTS>
8) node liri do-what-it-says

Usage:

node liri get-tweets
  This will return your last 20 tweets that you have tweeted.

node liri get-song "Galway Girl"
  This will return the song titled Galway Girl and will also give the artist, album, and a URL that
  will give you a 30 second preview of the song.

node liri movie-this Cinderella
  This will return a movie with the title Cinderella and give you a quick synopsis of the movie and 
  a link where there to find out more information about the movie.
`); // end template string
} // end help()

function about(){
  console.log(
`
${chalk.blue.bold("* Welcome to LIRI BOT Version Beta.05 *")} 
${chalk.blue("============================================")}
${chalk.blue.bold("by Julian Hasse")}


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
  logEntry("getWeather", input);
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

function setTimer(input){
  logEntry("timer", input);

  var lapse = parseInt(input);
  var waitTime = (lapse * 1000);
  var currentTime = 0;
  var waitInterval = 10;
  var percentWaited = 0;

  log("Timer for " + input + " seconds is running!")

function writePercentage(p){
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`waiting ... ${p}%`);
}

  var interval = setInterval(function(){
    currentTime += waitInterval;
    percentWaited = Math.floor((currentTime/waitTime) * 100)
    // log(`waiting ${currentTime/1000} seconds...`)
    writePercentage(percentWaited);
  }, waitInterval);

  setTimeout(function(){
    clearInterval(interval);
    writePercentage(100)
    log("\n\nTime is up! \n\n")
  }, waitTime);

  process.stdout.write("\n\n");
  writePercentage(percentWaited);

} // end timer

function setup(){
  console.log("This one is still a work in progress");
}

function menu(){
  inquire
    .prompt([
      {
        type: "list",
        message: "What would you like to do?",
        choices: ["Check twitter", "Check weather by city", "Set a timer", "Check song information", "Check movie information"],
        name: "choice"
      } // end questions
    ]) // end inquire.prompt()
    .then(function(response){
      var rc = response.choice;
      if(rc === "Check twitter"){
        getTweets();
      }else if(rc === "Check weather by city"){
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
      }else if(rc === "Set a timer"){
        inquire
          .prompt([
            {
              type: "input",
              message: "How many seconds?",
              name: "count"
            } // end questions()
          ]) // end inquire.prompt{}
          .then(function(response){
            var count = response.count;
            setTimer(count);
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
        console.log("I should add this to the function.")
      } // end if/else()
    }) // end then()
} // end prompt()

// Logging Functions
function logEntry(task, input){
  fs.appendFile("log.txt", ("****** LIRI's LOG ******\n" + Date() + "\n" + "User activated: " + task + " with value: " + input + "\nEnd of log."));
} // end logEntry

function log(input){
  console.log(chalk.green(input));
} //end log()