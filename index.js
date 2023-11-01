const dotenv = require('dotenv');
dotenv.config();

const { Configuration, OpenAIApi } = require('openai');
const ServerlessHttp = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { 
    interviewInitialAssitantMessage, 
    interviewSystemMessage, 
    promptInitialAssitantMessage, 
    promptSystemMessage 
} = require('./prompt.js');
const app = express();
const serverless = ServerlessHttp;

// const corsOptions = {
//   origin: 'https://career-pro-frontend.pages.dev',
//   //origin: 'http://localhost:3001',
//   credentials: true,
//   methods: 'GET, POST, OPTIONS',
//   allowedHeaders: ['Content-Type', 'Origin','Accept']
// }
// app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.post('/interview', async function(req, res) {
  var {job, userMessages, assistantMessages} = req.body;
  console.log(userMessages)
  console.log(assistantMessages)
  var messages = [
    {role: "system", content: interviewSystemMessage(job) },
    {role: "user", content: interviewSystemMessage(job)},
    {role: "assistant", content: interviewInitialAssitantMessage(job)}
  ];
  while(userMessages.length != 0 || assistantMessages.length != 0) {
    messages.push(
      {role:"user", content: String(userMessages.shift()).replace(/\n/g,"")}
    );
    messages.push(
      {role:"assistant", content: String(assistantMessages.shift()).replace(/\n/g,"")}
    );
  }
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 300
  });
  if(completion.data.choices[0].message) {
    console.log(completion.data.choices[0].message)
    res.send(completion.data.choices[0].message)
  }
})

app.post('/prompt', async function(req, res) {
  var {userMessages, assistantMessages} = req.body;
  var messages = [
    {role: "system", content: promptSystemMessage() },
    {role: "user", content: promptSystemMessage()},
    {role: "assistant", content: promptInitialAssitantMessage()}
  ];
  while(userMessages.length != 0 || assistantMessages.length != 0) {
    messages.push(
      {role:"user", content: String(userMessages.shift()).replace(/\n/g,"")}
    );
    messages.push(
      {role:"assistant", content: String(assistantMessages.shift()).replace(/\n/g,"")}
    );
  }
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 300
  });
  if(completion.data.choices[0].message) {
    console.log(completion.data.choices[0].message)
    res.send(completion.data.choices[0].message)
  }
})

module.exports.handler = serverless(app)
//app.listen(process.env.PORT)
