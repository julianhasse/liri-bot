# liri-bot

                * Welcome to LIRI-BOT Version 1.0.3 * 
            ============================================
                         by Julian Hasse



* Type "node liri help" to see this list

LIRI-BOT is an "intelligent assistant" that enables users to enter natural language 
commands in order to perform several tasks including: spotify's song info, omdb's movies data, 
check the weather, set a timer and retrieve your most recent twitter's timeline.


* Commands:

> node liri <ACTION> <ARGUMENTS> // <ACTION> is the main task, <ARGUMENTS> are the parameters for that action. 
> node liri menu  // you can also use (options | prompt | --m)
> node liri get-tweets  // you can also use (twitter | my-tweets | --t)
> node liri get-song // <title> you can also use (spotify-this-song | spotify | --s)
> node liri get-movie // <title you can also use (movie-this | omdb | --mv)
> node liri get-weather <ARGUMENTS> // <City | more than 2 words surrounded with quotations, eg. 'Austin TX'>
> node liri set-timer <ARGUMENTS> // <value in seconds | you can also use (--st)
> node liri do-what-it-says // will take the text of random.txt and call one of LIRI's commands)