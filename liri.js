// ================= Modules ========================
const fs = require("fs");
const keys = require("./keys.js");
const Twitter = require("twitter");
const Spotify = require("node-spotify-api");
const chalk = require("chalk");
const request = require("request");
const weather = require("weather-js");
const inquire = require("inquirer");


// ================== Init Variables ===============
var input = process.argv;
// user command
var task = input[2];
// single argument
var value = input[3];
// Process multiple arguments
for (var i = 3; i === input.length; i++) {
  value = value + " " + input[i];
}

// ================= Credentials ====================
// Twitter keys
var feed = new Twitter(keys.twitterKeys);
// Twitter user
var userTwitter = "dummy_mcdummy";
// Spotify keys
var spotify = new Spotify(keys.spotifyKeys);


// ======================= Commands ===============
switch(task){
  case "get-tweets":
  case "twitter":
  case "my-tweets":
  case "--t":
    getTweets();
    break;
  case "get-song":
  case "spotify-this-song":
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


// ============================= Twitter =====================================================
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
} // Twitter

// ===================== Spotify ===============================
function getSong(input){
  logEntry("getSong", input);
  var valType = "track";
  var song = input;

  if(input === "undefined undefined") {
    log("Wrong syntax. Please use 'node liri get-song <CITY>'\n");
    process.exit();
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
  }); 
} // Spotify

// ==================================== OMDB =======================================
function getMovie(input){
  logEntry("getMovie", input);
  var movie = input;
  if(movie === "undefined undefined"){
    var movie = "Mr. Nobody";
  }
  request(`http://www.omdbapi.com/?t=${movie}&y=&plot=short&apikey=40e9cece`, function(err, response, body) {
    if (!err && response.statusCode === 200) {

      log("Title: " + JSON.parse(body).Title);
      console.log("Release Year: " + JSON.parse(body).Year);
      console.log("Rated: " + JSON.parse(body).Rated);
      console.log("Runtime: " + JSON.parse(body).Runtime);
      console.log("IMDb Rating: " + JSON.parse(body).imdbRating);
      console.log("Production Country: " + JSON.parse(body).Country);
      console.log("Language: " + JSON.parse(body).Language);
      console.log("Director: " + JSON.parse(body).Director);
      console.log("Actors: " + JSON.parse(body).Actors);
      console.log("More info: " + JSON.parse(body).Website + "\n");
      var plot =  JSON.parse(body).Plot;
      log(`Plot: ${plot}\n`);
    } 
  });  
} // OMDB

// ======================= Weather ======================================
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
     }
   }); 
  } 
} // Weather

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
  console.log("Add functionality here");
}

//============================== Utility Functions ==============================================

function help(){
  console.log(
`
${chalk.white("Welcome to Liri-Bot * This is the online help utility * Version 1.0.9")}
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

> node liri <ACTION> <ARGUMENTS> ${chalk.red("// <ACTION> is the main task, <ARGUMENTS> are the parameters for that action.")} 
> node liri menu ${chalk.red(" // you can also use (options | prompt | --m)")}
> node liri get-tweets ${chalk.red(" // you can also use (twitter | my-tweets | --t)")}
> node liri get-song ${chalk.red("// <title> you can also use (spotify-this-song | spotify | --s)")}
> node liri get-movie ${chalk.red("// <title you can also use (movie-this | omdb | --mv)")}
> node liri get-weather <ARGUMENTS> ${chalk.red("// <City | more than 2 words surrounded with quotations, eg. 'Austin TX'>")}
> node liri set-timer <ARGUMENTS> ${chalk.red("// <value in seconds | you can also use (--st)")}
> node liri do-what-it-says ${chalk.red("// will take the text of random.txt and call one of LIRI's commands)")}

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
        choices: ["Check twitter", "Movie information", "Song information", "Weather information", "Set a timer", "Help", "About", "Exit"],
        name: "choice"
      } // end questions
    ]) // end inquire.prompt()
    .then(function(response){
      var userSelection = response.choice;
      if (userSelection === "Check twitter"){
        getTweets();
      } else if (userSelection === "Weather information"){
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
      } else if (userSelection === "Song information"){
        inquire
          .prompt([
            {
              type: "input",
              message: "Please enter the title:",
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
      } else if (userSelection === "Exit"){
              log("Thank you for using LIRI-BOT.\n")
              process.exit();
      } else if (userSelection === "Movie information"){
        inquire
          .prompt([
            {
              type: "input",
              message: "Please enter the title:",
              name: "movie"
            } // questions()
          ]) // inquire.menu()
          .then(function(response){
            var movie = response.movie;
            getMovie(movie);
          }) // inquire.menu()
      } else {
        console.log("This option is not available.")
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