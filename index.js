'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const imdb = require('imdb-api')

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

let token = "EAACl0MiDsHABADi58IVzbUkRIaB6aEcixXv2uViGOEOw1QR8egx2EuprsPIe0ifWCue9j9coHFRDj32Rc1X0uM5THGuv5fo5A55nSqeerX5HnHcux7dQnBKCXYkHnpk7iEt6ZAlmR215RFhEK3gZCwaPtNYe5L0Jlmec5VjeLZBnK8psKg8"

app.post('/webhook/', function(req, res) {
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
	if (text.includes("Action")) 
	{
		sendText(sender, "I like Action movies too")
		sendImageMessage(sender)
		sendButtonMessage(sender, "What is your favorite genre?")
	}
	else if (text.includes("Romance"))
	{
		sendText(sender, "I like Romance movies too")
		sendButtonMessage(sender, "What is your favorite genre?")
		sendGenericMessage(sender)
	}
	else (text.includes("Comedy") )
	{
		sendText(sender, "I like Comedy movies too")
		sendButtonMessage(sender, "What is your favorite genre?")
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
          }
        ]
      }
    }
	}
	sendRequest(sender, messageData)
}

function sendImageMessage(sender)
{
	let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
         "template_type": "media",
         "elements": [
            {
               "media_type": "image",
               "url": "https://cdn3.whatculture.com/images/2015/02/Last-Action-Hero-600x400.jpg"
            }
         ]
      }
    }    
  }
  sendRequest(sender, messageData)
}

function sendGenericMessage(sender)
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
              "url": "https://peterssendreceiveapp.ngrok.io/view?item=103",
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
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