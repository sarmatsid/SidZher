const express = require("express"); // подключение express
const path = require('path'); // подключение path для sendFile
const redis = require('redis'); //  устанавливаем пакет "redis"
const redisClient = redis.createClient(); // создаем его инстанс
const app = express(); // создаем объект приложения
const bodyParser = require("body-parser"); // подключаем из зависимостей bodyParser
app.use(bodyParser.json())

var bcrypt = require('bcrypt'); // подключаем bcrypt
var salt = bcrypt.genSaltSync(10); // подключаем соль

let loggedIn = false;

app.post('/api/register', (req, res) => {
   let login = req.body["Login"], password = req.body["Password"];
   let passwordToSave = bcrypt.hashSync(password, salt); 
//   var data = { 'password': passwordToSave, 'loggedIn': false };
//   data = JSON.stringify(data);
   redisClient.get(login, (err, reply) => {
      if (err) throw err;
      if (reply == undefined) {
         redisClient.set(login, passwordToSave, (err, reply) => {
            if (err) throw err;
            loggedIn = true;
            res.status(200).json('ОК');
         });
      } else {
         res.status(400).json('Такой логин уже есть');
      }
   });
}); 

app.post('/api/login', async function (req, res)  {
   let login = req.body["Login"];
   let json = {
      "step": 1,
      "req_type": "auth",
      "user": login,
      "data": ""
   }
   let json_backend = JSON.stringify(json);
   // console.log(json_backend);
   const Net = require('net');

   const port = 5141;
   const host = '127.0.0.1';
   

   const client = new Net.Socket();
   // Send a connection request to the server.
   client.connect({ port: port, host: host }, function() {
       // If there is no error, the server has accepted the request and created a new 
       // socket dedicated to us.
       console.log('TCP connection established with the server.');
   
       // The client can now send data to the server by writing to its socket.
       client.write(json_backend);
   });
   
   // The client can also receive data from the server by reading from its socket.
   client.on('data', function(chunk) {
       console.log(`Data received from the server: ${chunk.toString()}.`);
       
       // Request an end to the connection after the data has been received.
       client.end();
   });
   
   client.on('end', function() {
       console.log('Requested an end to the TCP connection');
   });
});



app.get('/logout/', (req, res) => {
   loggedIn = false;
   res.send({ data: "OK" });
}); 
app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'public/'));
});
app.get('/login.js', (req, res) => {
   res.sendFile(path.join(__dirname, 'public/login.js'));
});
app.use(function (req, res, next) {
   if (loggedIn == false) return res.redirect('/');
   next();
});

// app.get("/HW_2.html", function (request, response) {
//    if (loggedIn) {
//       response.sendFile(path.join(__dirname, 'public/HW_2.html'));
//    } else {
//       response.sendFile(path.join(__dirname, 'public/'));
//    }
// });

app.use(express.static('public'));

app.listen(3000); // слушаем 3000 порт

// тестовое создание GET-запроса
// app.get('/get/', (req, res) => {
//    res.send({ data: "Hello" });
// });


// РАБОТА В КЛАССЕ

// const http = require('http');
// const fs = require('fs');

// const requestListener = async function (req, res) {
//    console.log(req.url);
//    if (req.url === '/') {
//       const data = fs.readFileSync('public/HW_2.html', {
//          encoding: 'utf8',
//       });
//       res.setHeader('Content-Type', 'text/html');
//       res.writeHead(200);
//       res.end(data);
//    } else if (req.url === '/page1') {
//       const data = fs.readFileSync('public/Page_1.html', {
//          encoding: 'utf8',
//       });
//       res.setHeader('Content-Type', 'text/html');
//       res.writeHead(200);
//       res.end(data);
//    } else if (req.url === '/page2') {
//       const data = fs.readFileSync('public/Page_2.html', {
//          encoding: 'utf8',
//       });
//       res.setHeader('Content-Type', 'text/html');
//       res.writeHead(200);
//       res.end(data);
//    } else if (req.url === '/HW_2_style.css') {
//       const data = fs.readFileSync('public/HW_2_style.css', {
//          encoding: 'utf8',
//       });
//       res.setHeader('Content-Type', 'text/css');
//       res.writeHead(200);
//       res.end(data);
//    } else {
//       res.writeHead(404);
//       res.end();
//    }
// };

// const server = http.createServer(requestListener);
// const host = 'localhost';
// const port = 8000;
// server.listen(port, host, function () {
//    console.log(`Server is running on http://${host}:${port}`);
// });
