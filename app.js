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
   let login = req.body["Login"], password = req.body["Password"];
   redisClient.get(login, (err, reply) => {
      if (err) throw err;
      if ((reply != undefined)) {
         pass = JSON.parse(reply)['password'];
         
         if (bcrypt.compareSync(password, pass)) {
            if (err) throw err;
//            loggedIn = JSON.parse(reply)['loggedIn'];
            loggedIn = true;
            res.status(200).json('ОК');
            // if (loggedIn != true) {
            //    data = JSON.parse(reply);
            //    data['loggedIn'] = true;
            //    data = JSON.stringify(data);
            //    redisClient.set(login, data, (err, reply) => {
            //       if (err) throw err;
            //       res.status(200).json('ОК');
            //    });
            // } else {
            //    if (err) throw err;
            //    res.status(200).json('ОК');
            // }
         } else {
            res.status(400).json('Неверный пароль');
         }
      } else {
         res.status(400).json('Неверный логин');
      }   
   });
});

// app.get('/logout/', (req, res) => {
//    redisClient.get(login, (err, reply) => {
//       if (err) throw err;
//       if ((reply != undefined)) {
//          data = JSON.parse(reply)
//          data['loggedIn'] = false;
//          data = JSON.stringify(data);
//          redisClient.set(login, data, (err, reply) => {
//             if (err) throw err;
//             res.status(200).json('ОК');
//          });
//       } 
//    res.send({ data: "OK" });
//    }); 
// });

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
