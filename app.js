const express = require("express"); // подключение express
const path = require('path'); // подключение path для sendFile
const app = express(); // создаем объект приложения
const bodyParser = require("body-parser"); // подключаем из зависимостей bodyParser
const Net = require('net'); // пакет, используемый для создания socket
app.use(bodyParser.json());

const port = 5141; // задаем в виде переменной порт для создания соединения с crypto module
const host = '127.0.0.1'; // задаем в виде переменной адрес для создания соединения с crypto module

// let loggedIn = false;

app.post('/api/register_step1', (req, res) => {
   let json = {
      "step": 1,  // шаг (всего их будет 4)
      "req_type": "reg",  // действие (регистрация или авторизация)
      "user": req.body["Login"], // логин
      "data": "" // на step 1 ничего не передается; на step 2 передается public key; 
      // на step 3 передается зашифрованный пароль; на step 4 передается status "OK" или "ERROR CHECK USERNAME!"
   };
   json_backend = JSON.stringify(json);

   const client = new Net.Socket(); // создаем первый socket для соединения с crypto module и передачи ему данных
   client.connect({ port: port, host: host }, function () { }); // создаем connect на хост:127.0.0.1 и порт:5141
   client.write(json_backend);

   client.on('data', function (chunk) { // здесь мы принимаем step 2 со стороны crypto module
      console.log(chunk.toString()); // выводим step 2
      let json_req = JSON.parse(chunk); // распарсили наш json (откуда можно забирать данные) из ответа с crypto module в socket - chunk
      if (json_req.step == 2) { // проверяем что crypto module нам не выдал ошибку (иначе step был бы равен 1)
         res.status(200).json(({ status: 200, data: json_req.data })); // передаем на сторону пользователя параметр status:200 - код состояния
         // и в data передаем public key
      } else {
         res.status(400).json(({ status: 400 })); // если неправильный логин, то отстреливаем 400 status
      }
      client.end(); // закрываем соединение с crypto module
   });
});

app.post('/api/register_step3', async function (req, res) { // step 3, когда я передаю на crypto module зашифрованный пароль
   // создается также json, куда записываются логин и зашифрованный пароль
   json = {
      "step": 3,
      "req_type": "reg",
      "user": req.body["Login"],
      "data": req.body["Password"]
   };
   json_backend = JSON.stringify(json); //переменную json как раз преобразуем в json-формат

   const client_2 = new Net.Socket();  // снова открываем socket, чтобы отправить зашифрованный пароль на crypto module
   client_2.connect({ port: port, host: host }, function () { }); // создаем connect на хост:127.0.0.1 и порт:5141
   client_2.write(json_backend); // отправляем в socket наш json - записываем в него данные из нашего json

   client_2.on('data', function (chunk) { // здесь мы принимаем step 42 со стороны crypto module
      console.log(chunk.toString()); // выводим step 4
      let json_req = JSON.parse(chunk); // распарсили наш json (откуда можно забирать данные) из ответа с crypto module в socket - chunk
      if ((json_req.step == 4) && json_req.data == "OK") { // для перехода при логине на следующую страницу создаем проверку:
         // 1) status = 200, ответ от crypto module в поле data = "OK"
         res.status(200).json(); // передаем на сторону пользователя параметр status:200
      } else {
         res.status(400).json(); // если проверка не прошла, то передаем status:400
      }
      client_2.end(); // закрываем соединение с crypto module
   });
});

app.post('/api/login_step1', async function (req, res) { // step 1, когда я на crypto module отправляю логин на проверку
   // создаем json, с помощью которого будем обмениваться с crypto module
   let json = {
      "step": 1,  // шаг (всего их будет 4)
      "req_type": "auth",  // действие (регистрация или авторизация)
      "user": req.body["Login"], // логин
      "data": "" // на step 1 ничего не передается; на step 2 передается public key; 
      // на step 3 передается зашифрованный пароль; на step 4 передается status "OK" или "FAIL"
   };
   json_backend = JSON.stringify(json); //переменную json как раз преобразуем в json-формат

   const client = new Net.Socket(); // создаем первый socket для соединения с crypto module и передачи ему данных
   client.connect({ port: port, host: host }, function () { }); // создаем connect на хост:127.0.0.1 и порт:5141
   client.write(json_backend); // отправляем в socket наш json - записываем в него данные из нашего json

   client.on('data', function (chunk) { // здесь мы принимаем step 2 со стороны crypto module
      console.log(chunk.toString()); // выводим step 2
      let json_req = JSON.parse(chunk); // распарсили наш json (откуда можно забирать данные) из ответа с crypto module в socket - chunk
      if (json_req.step == 2) { // проверяем что crypto module нам не выдал ошибку (иначе step был бы равен 1)
         res.status(200).json(({ status: 200, data: json_req.data })); // передаем на сторону пользователя параметр status:200 - код состояния
         // и в data передаем public key
      } else {
         res.status(400).json(({ status: 400 })); // если неправильный логин, то отстреливаем 400 status
      }
      client.end(); // закрываем соединение с crypto module
   });
});

app.post('/api/login_step3', async function (req, res) { // step 3, когда я передаю на crypto module зашифрованный пароль
   // создается также json, куда записываются логин и зашифрованный пароль
   json = {
      "step": 3,
      "req_type": "auth",
      "user": req.body["Login"],
      "data": req.body["Password"]
   };
   json_backend = JSON.stringify(json); //переменную json как раз преобразуем в json-формат

   const client_2 = new Net.Socket();  // снова открываем socket, чтобы отправить зашифрованный пароль на crypto module
   client_2.connect({ port: port, host: host }, function () { }); // создаем connect на хост:127.0.0.1 и порт:5141
   client_2.write(json_backend); // отправляем в socket наш json - записываем в него данные из нашего json

   client_2.on('data', function (chunk) { // здесь мы принимаем step 42 со стороны crypto module
      console.log(chunk.toString()); // выводим step 4
      let json_req = JSON.parse(chunk); // распарсили наш json (откуда можно забирать данные) из ответа с crypto module в socket - chunk
      if ((json_req.step == 4) && json_req.data == "OK") { // для перехода при логине на следующую страницу создаем проверку:
         // 1) status = 200, ответ от crypto module в поле data = "OK"
         res.status(200).json(); // передаем на сторону пользователя параметр status:200
      } else {
         res.status(400).json(); // если проверка не прошла, то передаем status:400
      }
      client_2.end(); // закрываем соединение с crypto module
   });
});

app.get('/logout/', (req, res) => { // подключается кнопка logout, и отправляем на сторону пользователя data:"OK" для перехода в корневую директорию
   // loggedIn = false;
   res.send({ data: "OK" });
});
app.get('/', (req, res) => { // говорим, что корневая страница - это index.html
   res.sendFile(path.join(__dirname, 'public/'));
});
app.get('/login.js', (req, res) => { // подключаем login.js для обращений к этому файлу
   res.sendFile(path.join(__dirname, 'public/login.js'));
});
app.get('/jsencrypt.min.js', (req, res) => { // подключаем jsencrypt.min.js для обращений к этому файлу
   // jsencrypt.min.js - js-файл, в котором реализован модуль шифрования нашего пароля (ключи генерируются в crypto module, там же производится дешифрование)
   res.sendFile(path.join(__dirname, 'public/jsencrypt.min.js'));
});
// app.use(function (req, res, next) {
//    if (loggedIn == false) return res.redirect('/');
//    next();
// });

app.use(express.static('public')); // подключаем папку public для обращения к страница внутри нее

app.listen(3000); // слушаем 3000 порт, на котором крутится localhost