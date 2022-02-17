const express = require("express"); // подключение express
const path = require('path'); // подключение path для sendFile
const redis = require('redis'); //  устанавливаем пакет "redis"
const redisClient = redis.createClient(); // создаем его инстанс
const app = express(); // создаем объект приложения
const bodyParser = require("body-parser"); // подключаем из зависимостей bodyParser
const Net = require('net');
app.use(bodyParser.json())

var bcrypt = require('bcrypt'); // подключаем bcrypt
var salt = bcrypt.genSaltSync(10); // подключаем соль

var cryptico = require('cryptico');

const port = 5141;
const host = '127.0.0.1';

const client = new Net.Socket();
client.connect({ port: port, host: host }, function () { });


// const NodeRSA = require("encrypt-rsa").default;
// const fs = require('fs');

// const nodeRSA = new NodeRSA();
// const { privateKey, publicKey } = nodeRSA.createPrivateAndPublicKeys()

// fs.writeFileSync('./private-key', privateKey);
// fs.writeFileSync('./public-key', publicKey);

// var JSEncrypt = require('jsencrypt');

var PlainText = 'Sasha';



// var crypt = new JSEncrypt();// Создаем экземпляр объекта библиотеки для шифрования
// crypt.setPublicKey(pubKey);// Передаём объекту библиотеки шифрования публичный ключ, который является текстовой строкой(string)
// var data = 'Sasha';// В этой переменной текст который будем шифровать
// var cryptoData = crypt.encrypt(data);// Получаем зашифрованные данные
// console.log('Зашифрованый текст:'+cryptoData);// Выводим зашифрованное сообщение


// const encryptedText = nodeRSA.encryptStringWithRsaPublicKey({ 
//    text: 'login', 
//    keyPath: key
//  });

//  console.log({ encryptedText });






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

app.post('/api/login', async function (req, res) {
   let login = req.body["Login"];
   let json = {
      "step": 1,
      "req_type": "auth",
      "user": login,
      "data": "" /*  }asfasfasf}    */
   };
   let json_backend = JSON.stringify(json);

   client.write(json_backend);

   client.on('data', function (chunk) {
      var json_req = JSON.parse(chunk);
      if (json_req.step == 2) {
         var EncryptionResult = cryptico.encrypt(login, json_req.data);
         if (EncryptionResult.status == 'success') {

            // console.log(EncryptionResult.cipher);
            // json_req.step = 3;
            // json_req.data = EncryptionResult.cipher;

            json = {
               "step": 3,
               "req_type": "auth",
               "user": login,
               "data": `${EncryptionResult.cipher}`
            };

            json_backend = JSON.stringify(json);

            client.write(json_backend);
         }
      }
   });

   client.on('data', function (chunk) {
      console.log(chunk.toString());
      // client.pause();
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

app.use(express.static('public'));

app.listen(3000); 