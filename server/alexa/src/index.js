/**
 * - Web service: communicate with an external web service to get events for specified days in history (Wikipedia API)
 * - Pagination: after obtaining a list of events, read a small subset of events and wait for user prompt to read the next subset of events by maintaining session state
 * - Dialog and Session state: Handles two models, both a one-shot ask and tell model, and a multi-turn dialog model.
 * - SSML: Using SSML tags to control how Alexa renders the text-to-speech.
 */

 /* VoCal Examples
 *  user: "Alexa, start VoCal"
 *  Alexa: "Welcome to VoCal. Do you want to know what's happening today?"
 *  user: "yes" OR "April tenth"
 *  Alexa" "For April 10th, Javascript networking. Would you like to know about more events?"
 *  user: "yes"
 *  Alexa: "For April 11th, Nodejs meetup. Would to like to know about more events?"
 *  uaer: "No."
 *  Alexa: "goodBye!"
 */
var flagFirst = 0;
/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var https = require('https');

/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * Variable defining number of events to be read at one time
 */
var paginationSize = 1;

/**
 * Variable defining the length of the delimiter between events
 */
var delimiterSize = 2;

/**
 * VoCalSkill is a child of AlexaSkill.
 */
var VoCalSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
VoCalSkill.prototype = Object.create(AlexaSkill.prototype);
VoCalSkill.prototype.constructor = VoCalSkill;

VoCalSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("VoCalSkill onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

VoCalSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("VoCalSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
};

VoCalSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

VoCalSkill.prototype.intentHandlers = {

    "GetFirstEventIntent": function (intent, session, response) {
        handleFirstEventRequest(intent, session, response);
    },

    "GetNextEventIntent": function (intent, session, response) {
        handleNextEventRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "With VoCal, you can get your upcoming events. " +
            "For example, you could say today, or April thirteenth, or you can say exit. Now, which day do you want?";
        var repromptText = "Which day do you want to hear events for?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = {
                speech: "Goodbye",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.tell(speechOutput);
    }
};

/**
 * Function to handle the onLaunch skill behavior
 */

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var cardTitle = "Your upcoming events";
    var repromptText = "With VoCal, you can get your upcoming events. For example, you could say today, or April thirtienth, or you can say exit. Now, would you ?";
    var speechText = "<p>Welcome to VoCal.</p> <p>What day do you want events for?</p>";
    var cardOutput = "Welcome to VoCal. What day do you want events for?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.

    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardOutput);
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleFirstEventRequest(intent, session, response) {
    var daySlot = intent.slots.day;
    var repromptText = "With VoCal, you can get your upcoming events. For example, you could say today, or April thirtienth, or you can say exit. Now, which day do you want?";
    var monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
    ];
    var sessionAttributes = {};
    // Read the first 3 events, then set the count to 3
    sessionAttributes.index = paginationSize + 1;
    var date = "";

    // If the user provides a date, then use that, otherwise use today
    // The date is in server time, not in the user's time zone. So "today" for the user may actually be tomorrow
    if (daySlot && daySlot.value) {
        date = new Date(daySlot.value);
    } else {
        date = new Date();
    }

    var prefixContent = "<p>For " + monthNames[date.getMonth()] + " " + date.getDate() + ", </p>";
    var cardContent = "For " + monthNames[date.getMonth()] + " " + date.getDate() + ", ";

    var cardTitle = "Events on " + monthNames[date.getMonth()] + " " + date.getDate();

    //  Date is passed into the mongo model function to fetch specific events
    getJsonEventsFromMongo(date, function (results) {
        //processing results passed in to get specific data
        console.log("results in first event intent ", results);
        //Creating a string of events for Alexa to read
        // var events = results["events"][2]["subject"];
        // console.log("results parsed: ", results["events"]);

        var events = [];
        events.push( results["events"][0]["subject"], results["events"][1]["subject"], results["events"][3]["subject"] )
        // var events = [];
        // for (var r = 0; r <= results["events"].length; r++) {
        //     events.push(results["events"][r]["subject"]);
        // }

        var speechText = "",
            i;
        sessionAttributes.text = events;
        session.attributes = sessionAttributes;
        if (events.length == 0) {
            speechText = "You do not have any events on the requested date.";
            cardContent = speechText;
            response.tell(speechText);
        } else {
            for (i = 0; i < paginationSize; i++) {
                cardContent = cardContent + events[i] + " ";
                speechText = "<p>" + speechText + events[i] + "</p> ";
            }
            speechText = speechText + " <p>Want to hear more future events?</p>";
            var speechOutput = {
                speech: "<speak>" + prefixContent + speechText + "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };
            var repromptOutput = {
                speech: repromptText,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
        }

    });

    flagFirst++;
    console.log("flag after first: ", flagFirst);
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
function handleNextEventRequest(intent, session, response) {
 flagFirst++;
 console.log("flag after both: ", flagFirst);
    var cardTitle = "With VoCal, you can get your upcoming events.",
        sessionAttributes = session.attributes,
        result = sessionAttributes.text,
        speechText = "",
        cardContent = "",
        repromptText = "Do you want to hear more events?",
        i;
    if (!result) {
        speechText = "With VoCal, you can get your upcoming events.";
        cardContent = speechText;
    } else if (sessionAttributes.index >= result.length) {
        speechText = "There are no more events for this date. Try another date by saying <break time = \"0.3s\"/> get events for august thirtieth.";
        cardContent = "There are no more events for this date. Try another date by saying, get events for august thirtieth.";
    } else {
        // for (i = 1; i < paginationSize; i++) {
        //     if (sessionAttributes.index>= result.length) {
        //         break;
        //     }
            console.log( "in second rsponse: ", result[sessionAttributes.index] ,"  AND , ", result );
            speechText = speechText + "<p>" + result[sessionAttributes.index] + "</p> ";
            cardContent = cardContent + result[sessionAttributes.index] + " ";
            sessionAttributes.index++;
        // }
        if (sessionAttributes.index < result.length) {
            speechText = speechText + "Do you want to hear more events?";
            cardContent = cardContent + "Do you want to hear more events?";
        }
    }
    var speechOutput = {
        speech: "<speak>" + speechText + "</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
}

// VoCal- Change this function to return a json object of relevant events 

function getJsonEventsFromMongo(date, eventCallback) {

    // Make a database call to get events for a specific day (date)
    var url = 'https://vocal.meteorapp.com/publications/events';

    https.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = JSON.parse(body);
            console.log("result is: ", stringResult);
            eventCallback(stringResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });


    // The stringResult should be the parsed field value that we want to pass to Alexa to speak out
    // var stringResult = [ "Javascript meetup at capital factory", "NodeJS lecture at MakerSquare" ];

/*response body looks like:
    {
        "counts":[{"_id":"numberOfEvents","count":3}],
        "events":[{"_id":"tNnQwdBGD3tQnvPJa",
        "subject":"event 1"},{"_id":"nD5WT5BwHfPBEvEbB",
        "subject":"event 2"},{"_id":"K7XCMnWzvNSko5gWw",
        "name":"Nicks Test Event",
        "startDate":"2016-04-21T05:00:00.000Z","startHour":5,
        "startMinute":30,"subject":"A Test Event"}]
    } 
*/

}


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HistoryBuff Skill.
    var skill = new VoCalSkill();
    skill.execute(event, context);
};

