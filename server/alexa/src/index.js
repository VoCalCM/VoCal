/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
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
 * URL prefix to download history content from Wikipedia
 */
var urlPrefix = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&explaintext=&exsectionformat=plain&redirects=&titles=';

/**
 * Variable defining number of events to be read at one time
 */
var paginationSize = 3;

/**
 * Variable defining the length of the delimiter between events
 */
var delimiterSize = 2;

/**
 * VoCalSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
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
        var speechText = "With VoCal, you can get your upcoming events.  " +
            "For example, you could say today, or April thirteenth, or you can say exit. Now, which day do you want?";
        var repromptText = "Which day do you want?";
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
    var speechText = "<p>VoCal.</p> <p>What day do you want events for?</p>";
    var cardOutput = "VoCal. What day do you want events for?";
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
    sessionAttributes.index = paginationSize;
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

//wikipedia piece
    getJsonEventsFromWikipedia(monthNames[date.getMonth()], date.getDate(), function (events) {
        // var speechText = "",
        //     i;
        // sessionAttributes.text = events;
        // session.attributes = sessionAttributes;
        // if (events.length == 0) {
        //     speechText = "There is a problem connecting to Wikipedia at this time. Please try again later.";
        //     cardContent = speechText;
        //     response.tell(speechText);
        // } else {
        //     for (i = 0; i < paginationSize; i++) {
        //         cardContent = cardContent + events[i] + " ";
        //         speechText = "<p>" + speechText + events[i] + "</p> ";
        //     }
        //     speechText = speechText + " <p>Wanna go deeper in history?</p>";
        //     var speechOutput = {
        //         speech: "<speak>" + prefixContent + speechText + "</speak>",
        //         type: AlexaSkill.speechOutputType.SSML
        //     };
        //     var repromptOutput = {
        //         speech: repromptText,
        //         type: AlexaSkill.speechOutputType.PLAIN_TEXT
        //     };
        //     response.askWithCard(speechOutput, repromptOutput, cardTitle, cardContent);
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
                speechText = "<p>" + speechText + events[i].notes + "</p> ";
            }
            speechText = speechText + " <p>Wanna get more future?</p>";
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
}

/**
 * Gets a poster prepares the speech to reply to the user.
 */
 //VoCal - change to take future events request
function handleNextEventRequest(intent, session, response) {
    var cardTitle = "With VoCal, you can get your upcoming events.",
        sessionAttributes = session.attributes,
        result = sessionAttributes.text,
        speechText = "",
        cardContent = "",
        repromptText = "Do you want more events on this date?",
        i;
    if (!result) {
        speechText = "With VoCal, you can get your upcoming events.";
        cardContent = speechText;
    } else if (sessionAttributes.index >= result.length) {
        speechText = "There are no more events for this date. Try another date by saying <break time = \"0.3s\"/> get events for august thirtieth.";
        cardContent = "There are no more events for this date. Try another date by saying, get events for august thirtieth.";
    } else {
        for (i = 0; i < paginationSize; i++) {
            if (sessionAttributes.index>= result.length) {
                break;
            }
            speechText = speechText + "<p>" + result[sessionAttributes.index] + "</p> ";
            cardContent = cardContent + result[sessionAttributes.index] + " ";
            sessionAttributes.index++;
        }
        if (sessionAttributes.index < result.length) {
            speechText = speechText + "Wanna lookup future events?";
            cardContent = cardContent + "Wanna lookup future events?";
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

function getJsonEventsFromWikipedia(day, date, eventCallback) {
    // var url = urlPrefix + day + '_' + date;

    // https.get(url, function(res) {
    //     var body = '';

    //     res.on('data', function (chunk) {
    //         body += chunk;
    //     });

    //     res.on('end', function () {
    //         var stringResult = parseJson(body);
    //         eventCallback(stringResult);
    //     });
    // }).on('error', function (e) {
    //     console.log("Got error: ", e);
    // });


    //  transform a moment object to a date object:
    //  moment().toDate();
    //  parse data from server and convert to Alexa friendly objects (transform date)

    var stringResult = [
        { 
            date:  "4/9/2016"  ,
            notes: "Javascript meetup at capital factory"
        },
        {
            date: "4/9/2016",
            notes: "email nodejs meetup group"
        }
    ];
    eventCallback(stringResult);

}

function parseJson(inputText) {
    // sizeOf (/nEvents/n) is 10
    var text = inputText.substring(inputText.indexOf("\\nEvents\\n")+10, inputText.indexOf("\\n\\n\\nBirths")),
        retArr = [],
        retString = "",
        endIndex,
        startIndex = 0;

    if (text.length == 0) {
        return retArr;
    }

    while(true) {
        endIndex = text.indexOf("\\n", startIndex+delimiterSize);
        var eventText = (endIndex == -1 ? text.substring(startIndex) : text.substring(startIndex, endIndex));
        // replace dashes returned in text from Wikipedia's API
        eventText = eventText.replace(/\\u2013\s*/g, '');
        // add comma after year so Alexa pauses before continuing with the sentence
        eventText = eventText.replace(/(^\d+)/,'$1,');
        eventText = 'In ' + eventText;
        startIndex = endIndex+delimiterSize;
        retArr.push(eventText);
        if (endIndex == -1) {
            break;
        }
    }
    if (retString != "") {
        retArr.push(retString);
    }
    retArr.reverse();
    return retArr;
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HistoryBuff Skill.
    var skill = new VoCalSkill();
    skill.execute(event, context);
};

