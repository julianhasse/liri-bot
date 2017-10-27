// ================= Modules ========================
const fs = require("fs");
const keys = require("./keys.js");
const Twitter = require("twitter");
const Spotify = require("node-spotify-api");
const request = require("request");
const weather = require("weather-js");
const inquire = require("inquirer");
const chalk = require("chalk");

// ================== Init Variables ===============
var input = process.argv;
var action = input[2];
var value = input[3];
// Twitter
var feed = new Twitter(keys.twitterKeys);
var userTwitter = "dummy_mcdummy";
// Spotify
var spotify = new Spotify(keys.spotifyKeys);
// Process arguments
for (var i = 3; i === input.length; i++) {
  value = value + " " + input[i];
}

// ======================= Commands ===============
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
  case "menu":
  case "options":
  case "prompt":
  case "--m":
    menu();
    break;
  case "setup":
    setup();
    break;
} // commands


//============================== Main Functions ==============================================

function getTweets(){
  logEntry("getTweets", null);

  feed.get('statuses/user_timeline', userTwitter, function(err, tweets, response){
    if(err) {
      console.log(err);
    } 
    if ( response.statusCode === 200 ) {
      for(i = 0; i < tweets.length; i++){
        var text = tweets[i].text;
        var time = tweets[i].created_at;
        var stamp = time.substr(0, 19);

        log(`On ${stamp}, you tweeted:`);
        console.log(`"${text}"\n`);
      } 
    } 
  }); 
} // getTweets()

function getSong(input){
  logEntry("getSong", input);
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
    } // if()
  }); // request()
} // getMovie()

function getWeather(input){
  logEntry("getWeather", input);

  if (input === "undefined undefined"){
    log("Wrong syntax. Please use 'node liri weather <CITY>'\n");
    process.exit();
  } else {

  var city = input;
  
  weather.find({search: city, degreeType: "F"}, function(err, result){
    if(err){
      console.log(err);
    } else {

      var data = result[0].current;
      var temp = data.temperature;
      var celsius = Math.floor((5/9) * (temp-32));
      var time = data.observationtime;
      var city = data.observationpoint;
      var wind = data.winddisplay;
      var humidity = data.humidity;
      
      log(`
      Service provided by Liri-Bot Weather Channel.
      Checking the weather in ${city} at ${time}.
      ------------------------------------------------------------- 
      Temperature: ${temp}° F / ${celsius}° C
      Humidity: ${humidity}%
      Current Wind: ${wind}
      -------------------------------------------------------------
      5-Day Forecast: `)

      for (var i = 0; i < 5; i++){
      log(
      `      ${result[0].forecast[i].shortday} High: ${result[0].forecast[i].high}° / Low: ${result[0].forecast[i].low}°`)
      }
      log("      ------------------------------------------------------------")
      log("\n");
     }// if()
   }); // weather.find()
  } 
} // getWeather()

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
    writePercentage(percentWaited);
  }, waitInterval);

  setTimeout(function(){
    clearInterval(interval);
    writePercentage(100)
    log("\n\nTime is up! \n\n")
  }, waitTime);

  process.stdout.write("\n");
  writePercentage(percentWaited);

} // end timer

function setup(){
  console.log("This one is still a work in progress");
}

//============================== Utility Functions ==============================================

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
7) node liri set-timer <ARGUMENTS> ${chalk.red("// <value in seconds | you can also use (--st)")}
8) node liri do-what-it-says

`); // console.log()
} // help()

function about(){
  console.log(
`
${chalk.blue.bold("                * Welcome to LIRI-BOT Version 1.0.3 *")} 
${chalk.blue("            ============================================")}
${chalk.blue.bold("                         by Julian Hasse")}


${chalk.yellow(" $$ |      $$$$$$| $$$$$$$|  $$$$$$|       $$$$$$$|   $$$$$$| $$$$$$$$|  ")}
${chalk.yellow(" $$ |      |_$$  _|$$  __$$| |_$$  _|      $$  __$$| $$  __$$||__$$  __| ")}
${chalk.yellow(" $$ |        $$ |  $$ |  $$ |  $$ |        $$ |  $$ |$$ /  $$ |  $$ |    ")}
${chalk.yellow(" $$ |        $$ |  $$$$$$$  |  $$ |        $$$$$$$| |$$ |  $$ |  $$ |    ")}
${chalk.yellow(" $$ |        $$ |  $$  __$$<   $$ |        $$  __$$| $$ |  $$ |  $$ |    ")}
${chalk.yellow(" $$ |        $$ |  $$ |  $$ |  $$ |        $$ |  $$ |$$ |  $$ |  $$ |    ")}
${chalk.yellow(" $$$$$$$$| $$$$$$| $$ |  $$ |$$$$$$|       $$$$$$$  | $$$$$$  |  $$ |    ")}
${chalk.yellow(" |________||______||__|  |__||______|      |_______/  |______/   |__|    ")}


`); // console.log()
} // about()

function menu(){
  inquire
    .prompt([
      {
        type: "list",
        message: "What can I help you with?",
        choices: ["Check twitter", "Check movie information", "Check song information", "Check weather by city", "Set a timer", "Help", "About"],
        name: "choice"
      } // end questions
    ]) // end inquire.prompt()
    .then(function(response){
      var userSelection = response.choice;
      if (userSelection === "Check twitter"){
        getTweets();
      } else if (userSelection === "Check weather by city"){
        console.log("Weather report");
        inquire
          .prompt([
            {
              type: "input",
              message: "Please tell me the city you would like to check",
              name: "search"
            } // end questions()
          ]) // end inquire.prompt()
          .then(function(response){
            var search = response.search;
            getWeather(search);
          }); // end .then()
      } else if (userSelection === "Set a timer"){
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
      } else if (userSelection === "Check song information"){
        inquire
          .prompt([
            {
              type: "input",
              message: "What song should we look up?",
              name: "song"
            } // questions{}
          ]) // inquire.menu()
          .then(function(response){
            var song = response.song;
            getSong(song);
          }) // .then
      } else if (userSelection === "Help"){
              help();
      } else if (userSelection === "About"){
              about();
      } else if (userSelection === "Check movie information"){
        inquire
          .prompt([
            {
              type: "input",
              message: "What movie should we look up?",
              name: "movie"
            } // questions()
          ]) // inquire.menu()
          .then(function(response){
            var movie = response.movie;
            getMovie(movie);
          }) // inquire.menu()
      } else {
        console.log("I should add this to the function.")
      } // if/else()
    }) // then()
} // menu()


//============================== Logging Functions ==============================================
function logEntry(task, input){
  fs.appendFile("log.txt", ("****** LIRI's LOG ******\n" + Date() + "\n" + "User activated: " + task + " with value: " + input + "\nEnd of log.\n\n"));
} 

function log(input){
  console.log(chalk.green(input));
} 