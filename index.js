'use strict'


const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const mdb = require('moviedb')('98325a9d3ed3ec225e41ccc4d360c817');


app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route homepage
app.get('/', function (req, res) {
	res.send('If this shows, then the bot is running')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})


let token = "EAACl0MiDsHABADi58IVzbUkRIaB6aEcixXv2uViGOEOw1QR8egx2EuprsPIe0ifWCue9j9coHFRDj32Rc1X0uM5THGuv5fo5A55nSqeerX5HnHcux7dQnBKCXYkHnpk7iEt6ZAlmR215RFhEK3gZCwaPtNYe5L0Jlmec5VjeLZBnK8psKg8"

app.post('/webhook/', function(req, res) 
{
	//sendText(event.sender.id, "What type of Movie would you like to watch, Action, Comedy, or Romance?")
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i]
		let sender = event.sender.id
		if (event.message && event.message.text) {
			let text = event.message.text
			decideMessage(sender, text)
			//sendText(sender, "Text echo: " + text.substring(0, 100))
		}

		if (event.postback) {
			let text = JSON.stringify(event.postback)
			decideMessage(sender, text)
			continue
		}
	}
	res.sendStatus(200)
})

function decideMessage(sender, text1)
{
	let text = text1.toLowerCase()
	if (text.includes("action")) 
  {
    sendText(sender, "I like Action movies too")
    //sendImageMessage(sender)
    sendButtonMessage(sender, "What is your favorite genre?")
  }
  else if (text.includes("romance"))
  {
    sendText(sender, "I like Romance movies too")
    sendButtonMessage(sender, "What is your favorite genre?")
    sendGenericMessage(sender, text)
  }
  else if (text.includes("comedy") )
  {
    sendText(sender, "I like Comedy movies too")
    sendButtonMessage(sender, "What is your favorite genre?")
  }
  else 
  {
    sendText(sender, "That is not a genre, please list a genre")
  }
}

function sendText(sender, text) {
	let messageData = {text: text}
	sendRequest(sender, messageData)
}



function sendButtonMessage(sender, text)
{
	let messageData ={
	  "attachment":{
      "type":"template",
      "payload":{
        "template_type":"button",
        "text":text,
        "buttons":[
          {
            "type":"postback",
            "title": "Comedy",
            "payload":"comedy"
          },
          {
            "type":"postback",
            "title": "Action",
            "payload": "action"
          },
          {
          	"type": "postback",
          	"title": "Romance",
          	"payload": "romance"
          },
        ]
      }
    }
	}
	sendRequest(sender, messageData)
}

function sendMediaMessage(sender, imageURL)
{
	let messageData = {
    "attachment":{
      "type": "template",
      "payload":{
         "template_type":"media",
         "elements":[
            {
               "media_type": "image",
               "url": imageURL
            }
         ]
      }
    }    
  }
  sendRequest(sender, messageData)
}	

function sendGenericMessage(sender, text)
{
	let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"I love Romance",
            "image_url":"http://moviejoy.net/Romancemovies.jpg",
            "subtitle":"I love romance",
            "default_action": {
              "type": "web_url",
              "url": "http://www.imdb.com/search/title?&genres=romance&explore=title_type,genres",
              //"messenger_extensions": true,
              //"webview_height_ratio": "tall",
              //"fallback_url": "https://peterssendreceiveapp.ngrok.io/"
            },
            "buttons":[
              {
                "type":"web_url",
                "url":"http://www.imdb.com/search/title?&genres=romance&explore=title_type,genres",
                "title":"View Website"
              }              
            ]      
          }
        ]
      }
    }
  }
  sendRequest(sender, messageData)
}

function sendRequest(sender, messageData)
{
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}
	})
}

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
