// ================= Modules ========================
const fs = require("fs");
const exec = require("child_process").exec;
const keys = require("./keys.js");
// ================= Dependencies ========================
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
      console.log("An error has occurred: " + err);
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
    log("Wrong syntax. Please use 'node liri get-song <TITLE>'\n");
    process.exit();
  }

  spotify.search({ type:valType, query:song}, function(err, data){
    if (err){
      log("An error has occurred: " + err);
    } else {
      

      var songInfo = data.tracks.items;
      var artist = songInfo[0].artists[0].name;
      var song = songInfo[0].name;
      var album = songInfo[0].album.name;
      var previewUrl = songInfo[0].preview_url;
        
      log(`
      ------ Music information provided by Spoyify API -------- 

      Artist:  ${artist}
      Song:    ${song}
      Album:   ${album}

      -------------------------------------------------------- 
      `);
        inquire
        .prompt([
          {
            type: "confirm",
            message: "Would you like to hear a sample of the song?[y/n]",
            name: "sample"
          } 
        ])
        .then(function(response){
          if (response.sample){
            exec(`open ${previewUrl}`);
          } else {
            log(`
            Thanks for using Liri-Bot.
            Bye!\n
            `);
            return;
          }
        });
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

      var movieTitle = JSON.parse(body).Title;
      var movieYear = JSON.parse(body).Year;
      var movieRated = JSON.parse(body).Rated;
      var movieRuntime = JSON.parse(body).Runtime;
      var movieRating = JSON.parse(body).imdbRating;
      var movieCountry = JSON.parse(body).Country;
      var movieLanguage = JSON.parse(body).Language;
      var movieDirector = JSON.parse(body).Director;
      var movieCast = JSON.parse(body).Actors;
      var movieWeb = JSON.parse(body).Website;
      var moviePlot =  JSON.parse(body).Plot;



      log(`
      ---------------- Movie information provided by OMDB API -----------------
      Title: ${movieTitle}
      Release Year: ${movieYear}
      Rated: ${movieRated}
      Runtime: ${movieRuntime}
      IMDb Rating: ${movieRating} 
      Country: ${movieCountry}
      Language: ${movieLanguage}
      Director: ${movieDirector}
      Cast: ${movieCast}
      More info: ${movieWeb}
      -------------------------------------------------------------------------`);
      console.log(`      ${chalk.white("Plot: " + moviePlot)}\n`);
    } 

    inquire
    .prompt([
      {
        type: "confirm",
        message: "Would you like to visit the movie's website?",
        name: "sample"
      } 
    ])
    .then(function(response){
      if (response.sample){
        exec(`open ${movieWeb}`);
      } else {
        log(`
        Thanks for using Liri-Bot.
        Bye!\n
        `);
        return;
      }
    });


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
      console.log("An error has occurred: " + err);
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
  logEntry("random", null);
  
  fs.readFile("random.txt", "utf8", function(err, data) {
    if (err) {
      console.log("An error has occurred: " + err);
    } else {
      
      fileEntry = data.split(",");
      mainCommand = fileEntry[0];
      songTitle = fileEntry[1];

      spotify.search({ type: "track", query: songTitle}, function(err, data) {
        if (err) {
          console.log("An error has occurred: " + err);
          return;
        }
        var songInfo = data.tracks.items;
        var artist = songInfo[0].artists[0].name;
        var song = songInfo[0].name;
        var album = songInfo[0].album.name;
        var previewUrl = songInfo[0].preview_url;
          
        log(`
        ------ Music information provided by Spoyify API -------- 

        Artist:  ${artist}
        Song:    ${song}
        Album:   ${album}

        -------------------------------------------------------- 
        `);
            inquire
            .prompt([
              {
                type: "confirm",
                message: "Would you like to hear a sample of the song?[y/n]",
                name: "sample"
              } 
            ])
            .then(function(response){
              if (response.sample){
                exec(`open ${previewUrl}`);
              } else {
                log(`
                Thanks for using Liri-Bot.
                Bye!\n
                `);
                return;
              }
            });
          }
      )}
  });
} // random

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

} // Set timer


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

`); // console.log
} // help

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


`); // console.log
} // about

function menu(){
  inquire
    .prompt([
      {
        type: "list",
        message: "What can I help you with?",
        choices: ["Check twitter", "Movie information", "Song information", "Weather information", "Set a timer", "Help", "About"],
        name: "choice"
      } 
    ]) 
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
            } 
          ]) 
          .then(function(response){
            var search = response.search;
            getWeather(search);
          }); 
      } else if (userSelection === "Set a timer"){
        inquire
          .prompt([
            {
              type: "input",
              message: "How many seconds?",
              name: "count"
            } 
          ]) 
          .then(function(response){
            var count = response.count;
            setTimer(count);
          });
      } else if (userSelection === "Song information"){
        inquire
          .prompt([
            {
              type: "input",
              message: "Please enter the title:",
              name: "song"
            } 
          ]) 
          .then(function(response){
            var song = response.song;
            getSong(song);
          }) 
      } else if (userSelection === "Help"){
              help();
      } else if (userSelection === "About"){
              about();
      } else if (userSelection === "Movie information"){
        inquire
          .prompt([
            {
              type: "input",
              message: "Please enter the title:",
              name: "movie"
            } 
          ]) 
          .then(function(response){
            var movie = response.movie;
            getMovie(movie);
          }) 
      } else {
        console.log("This option is not available.")
      } 
    }) 
} // menu


//============================== Logging Functions ==============================================
function logEntry(task, input){
  fs.appendFile("log.txt", ("****** LIRI's LOG ******\n" + Date() + "\n" + "User activated: " + task + " with value: " + input + "\nEnd of log.\n\n"));
} 

function log(input){
  console.log(chalk.green(input));
} 