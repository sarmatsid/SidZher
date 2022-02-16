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

const port = 5141;
const host = '127.0.0.1';

var JSEncrypt = require('jsencrypt');
// const NodeRSA = require("encrypt-rsa").default;
// const fs = require('fs');

// const nodeRSA = new NodeRSA();
// const { privateKey, publicKey } = nodeRSA.createPrivateAndPublicKeys()

// fs.writeFileSync('./private-key', privateKey);
// fs.writeFileSync('./public-key', publicKey);


var pubKey = '-----BEGIN PUBLIC KEY-----'+
'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtuaSbiPgmOMHsWuVOC17'+
'IHxA+Zuctt3pKSd5cJhOHBgAJUMkz/Uiiuf0gxFdMt46sghG4gSkkuz4Pl61Q9/M'+
'1ZkK/K6/g0XkYWdSo3Iu17KvWLdtxgyvmnsrfANfTwExG/RNTN133B0pQdvyaq3K'+
'0bz+Ish2g9Q04e0ipglxuFpf7gKDHr0gUGAE6mX13Z8BohUC09YYQqPQBs93fJsc'+
'uuTgsLENMMjUN++K2ZkbPpSwsFx2uqmptjPpwXl+1+vYTKjuNx9fZZ76CcuGoVUf'+
'QaT4hE2AXtjOKCYTc7hILRHbWxlWVv4rSm/N8VAH0TwHXeB+gyGG+CLoITuIyNH8'+
'KQIDAQAB'+
'-----END PUBLIC KEY-----';

var crypt = new JSEncrypt();// Создаем экземпляр объекта библиотеки для шифрования
crypt.setPublicKey(pubKey);// Передаём объекту библиотеки шифрования публичный ключ, который является текстовой строкой(string)
var data = 'Sasha';// В этой переменной текст который будем шифровать
var cryptoData = crypt.encrypt(data);// Получаем зашифрованные данные
console.log('Зашифрованый текст:'+cryptoData);// Выводим зашифрованное сообщение


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

app.post('/api/login', async function (req, res)  {
   let login = req.body["Login"];
   let json = {
      "step": 1,
      "req_type": "auth",
      "user": login,
      "data": ""
   }
   let json_backend = JSON.stringify(json);

   const client = new Net.Socket();
   client.connect({ port: port, host: host }, function() { 

       console.log('TCP connection established with the server.');
   });

   client.end(json_backend);

   client.on('data', function(chunk) {
       console.log(`${chunk.toString()}.`);
       client.end();
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

