var express = require("express");
const axios = require("axios");
var app = express();
require("dotenv").config({ path: "./config.env" });

app.use(express.json()); //for parsing application/json

app.use(express.urlencoded({ extended: true }));
const url = "https://api.telegram.org/bot" + process.env.BOT_TOKEN;

app.post("/", (req, res) => {
  console.log(req.body);
  const chatId = req.body.message.chat.id;
  const sentMessage = req.body.message;

  //common  function for axios post
  function reply(method, message, field) {
    // console.log('message',message)
    if (field == "location" || field == "venue" || field == "contact") {
      data = message;
    } else {
      data = {
        chat_id: chatId,
        [field]: message,
      };
    }
    axios
      .post(`${url}/${method}`, data)
      .then((response) => {
        res.status(200).send(response);
      })
      .catch((error) => {
        res.send(error);
      });
  }

  //identifying the type of message
  if (sentMessage.text) {
    reply("sendMessage", sentMessage.text, "text");
  } else if (sentMessage.sticker) {
    reply("sendSticker", sentMessage.sticker.file_id, "sticker");
  } else if (sentMessage.photo) {
    reply("sendPhoto", sentMessage.photo[0].file_id, "photo");
  } else if (sentMessage.audio) {
    reply("sendAudio", sentMessage.audio.file_id, "audio");
  } else if (sentMessage.video) {
    reply("sendVideo", sentMessage.video.file_id, "video");
  } else if (sentMessage.video_note) {
    reply("sendVideoNote", sentMessage.video_note.file_id, "video_note");
  } else if (sentMessage.contact) {
    reply(
      "sendContact",
      {
        chat_id: chatId,
        phone_number: sentMessage.contact.phone_number,
        first_name: sentMessage.contact.first_name,
        last_name: sentMessage.contact.last_name,
        vcard: sentMessage.contact.vcard,
      },
      "contact"
    );
  } else if (sentMessage.location && sentMessage.venue) {
    reply(
      "sendVenue",
      {
        chat_id: chatId,
        latitude: sentMessage.location.latitude,
        longitude: sentMessage.location.longitude,
        title: sentMessage.venue.title,
        address: sentMessage.venue.address,
      },
      "venue"
    );
  } else if (sentMessage.location) {
    reply(
      "sendLocation",
      {
        chat_id: chatId,
        latitude: sentMessage.location.latitude,
        longitude: sentMessage.location.longitude,
      },
      "location"
    );
  } else if (sentMessage.animation && sentMessage.document) {
    reply("sendAnimation", sentMessage.animation.file_id, "animation");
  } else if (sentMessage.document) {
    reply("sendDocument", sentMessage.document.file_id, "document");
  } else {
    reply("sendMessage", "Hey ! you have sent wrong message", "text");
  }
});
// Listening
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
