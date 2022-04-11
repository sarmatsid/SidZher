// подключаем модули, которые подгружаются в package.json и package-lock.json
const express = require("express"); // подключение express
const path = require('path'); // подключение path для sendFile
const app = express(); // создаем объект приложения
const bodyParser = require("body-parser"); // подключаем из зависимостей bodyParser
const Net = require('net'); // пакет, используемый для создания socket
const cookieParser = require('cookie-parser');
const https = require('https'); // подключаем модуль https
const fs = require('fs'); // подключаем модуль fs для обращения к файлам
const fetch = require('node-fetch'); // подключаем сетевой модуль fetch
const helmet = require('helmet') // это модуль Node.js, который помогает защитить заголовки HTTP. Он реализован в экспресс-приложениях. 
// Таким образом, можно сказать, что Helmet.js помогает в обеспечении безопасности экспресс-приложений. Он устанавливает различные заголовки HTTP для предотвращения таких атак, как межсайтовый скриптинг (XSS), кликджекинг и т. д.
const { stringify } = require('querystring'); // требуется для проверки captcha для приведения в строковый формат передаваемых пареметров
const hsts = require('strict-transport-security'); // подключаем модуль hsts
const globalHSTS = hsts.getSTS({ 'max-age': { 'days': 365 }, includeSubDomains: true, strictTransportSecurity: true, preload: true }); // задаем переменную, в которой прописываем параметры hsts (время жизни в секундах - 1 год,
 // includeSubDomains:true - правило также применяется ко всем саб-доменам сайта, preload:true - следуя инструкциям и удачно отправив свой домен, браузер никогда не подключится к вашему домену через незащищённое соединение)
 const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');

app.use(helmet.frameguard()); // заголовок X-Frame-Options HTTP ограничивает, кто может поместить ваш сайт во фрейм, что может помочь смягчить такие вещи, как атаки кликджекинга. Заголовок имеет два режима: DENY и SAMEORIGIN.
app.disable('x-powered-by'); // отключаем заголовок http x-powered-by, так как он показывает, что используется фрэймворк express
app.use(globalHSTS); // говорим,что hsts работает на любой странице сайта
app.use(cookieParser('secret key')); // сообщает об использовании cookie и их обработке
app.use(bodyParser.json()); // сообщает системе, что мы хотим использовать json


// CSP
app.use(function (req, res, next) {
   res.setHeader(
      'Permissions-Policy', 'none'
   );
   res.setHeader(
      'X-Content-Type-Options', 'nosniff'
   );
   next();
});

app.use(expressCspHeader({
    directives: {
        'default-src': [SELF],
        'script-src': [SELF, INLINE, 'https://www.gstatic.com/recaptcha/', 
                                     'https://www.google.com/recaptcha/'],
        'style-src': [SELF, INLINE, 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css'],
        'img-src': [SELF],
        'frame-src': ['https://www.google.com/recaptcha/'],
        'worker-src': [SELF],
        'block-all-mixed-content': true
    }
}));

const port = 5141; // задаем в виде переменной порт для создания соединения с crypto module
const host = '127.0.0.1'; // задаем в виде переменной адрес для создания соединения с crypto module

// процесс регистраиции
app.post('/api/register_step1', (req, res) => { // получаю post-запрос от login.js со стороны пользователя
   // step 1, когда я на crypto module отправляю логин на проверку
   // создаем json, с помощью которого будем обмениваться с crypto module
   let json = {
      "step": 1,  // шаг (всего их будет 4)
      "req_type": "reg",  // действие (регистрация)
      "user": req.body["Login"], // логин
      "data": "" // на step 1 ничего не передается; на step 2 передается public key; 
      // на step 3 передается зашифрованный пароль; на step 4 передается status "OK" или "FAIL"
   };
   json_backend = JSON.stringify(json); //переменную json как раз преобразуем в json-формат для передачи

   const client = new Net.Socket(); // создаем первый socket для соединения с crypto module и передачи ему данных
   client.connect({ port: port, host: host }, function () { }); // создаем connect на хост:127.0.0.1 и порт:5141

   client.on('error', err => {
      console.log(err);
   });

   client.write(json_backend); // отправляем в socket наш json - записываем в него данные из нашего json

   client.on('data', async function (chunk) { // здесь мы принимаем step 2 со стороны crypto module
      console.log(chunk.toString()); // выводим step 2 - НАДО УБРАТЬ
      let json_req = JSON.parse(chunk); // распарсили наш json (откуда можно забирать данные) из ответа с crypto module в socket - chunk
      if (json_req.step == 2) { // проверяем что crypto module нам не выдал ошибку (иначе step был бы равен 0)
         // осуществляется проверка Captcha
         if (req.body.captcha === undefined || req.body.captcha === null || req.body.captcha === '') { // проверяется, 
            //вводилась ли captcha
            return res.status(400).json({ status: 400, success: false, msg: 'Please select captcha' }); // если нет, то отправляе ошибку
         }
         const secretKey = '6LddKkodAAAAAGzse4USLHw8Agn4k98bWdkxBnTz'; // secret key captcha

         // Verify URL - осуществляется проверка на стороне Google
         const query = stringify({ // формируются параметры для проверки
            secret: secretKey,
            response: req.body.captcha, // данные captcha
            remoteip: req.connection.remoteAddress
         });
         const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;
         const body = await fetch(verifyURL).then(res => res.json()); // Make a request to verifyURL

         // If not successful
         if (body.success !== undefined && !body.success) // если проверка пройдена не была, то отсылаем ошибку
            return res.status(400).json({ status: 400, success: false, msg: 'Failed captcha verification' });

         // If successful
         return res.status(200).json({ success: true, msg: 'Captcha OK', status: 200, data: json_req.data }); // передаем на 
         // сторону пользователя параметр status:200 - код состояния, статус обработки captcha (true) и в data передаем public key
      }
      else {
         res.status(400).json({ status: 400 }); // если логин уже существует, то отстреливаем status:400 
      }
      client.end(); // закрываем соединение с crypto module
   });
})

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

   client_2.on('data', function (chunk) { // здесь мы принимаем step 4 со стороны crypto module
      console.log(chunk.toString()); // выводим step 4 - НАДО УБРАТЬ
      let json_req = JSON.parse(chunk); // распарсили наш json (откуда можно забирать данные) из ответа с crypto module в socket - chunk
      if ((json_req.step == 4) && json_req.data == "OK") { // для перехода при логине на следующую страницу создаем проверку:
         // 1) status = 200, ответ от crypto module в поле data = "OK"
         res.cookie('cookies', req.body["Password"], { // создаем cookie
            maxAge: 3600 * 24, // 24 hours
            secure: true,
            httpOnly: true,
            signed: true,
            sameSite: 'strict'
         });
         res.status(200).json(); // передаем на сторону пользователя параметр status:200
      }
      else {
         res.status(400).json(); // если проверка не прошла (ошибка при дешифровании, внесении в БД), то передаем status:400
      }
      client_2.end(); // закрываем соединение с crypto module
   });
});

// процесс авторизации
app.post('/api/login_step1', async function (req, res) { // step 1, когда я на crypto module отправляю логин на проверку
   // создаем json, с помощью которого будем обмениваться с crypto module
   let json = {
      "step": 1,  // шаг (всего их будет 4)
      "req_type": "auth",  // действие (авторизация)
      "user": req.body["Login"], // логин
      "data": "" // на step 1 ничего не передается; на step 2 передается public key; 
      // на step 3 передается зашифрованный пароль; на step 4 передается status "OK" или "FAIL"
   };
   json_backend = JSON.stringify(json); //переменную json как раз преобразуем в json-формат

   const client = new Net.Socket(); // создаем первый socket для соединения с crypto module и передачи ему данных
   client.connect({ port: port, host: host }, function () { }); // создаем connect на хост:127.0.0.1 и порт:5141
   client.write(json_backend); // отправляем в socket наш json - записываем в него данные из нашего json

   client.on('data', async function (chunk) { // здесь мы принимаем step 2 со стороны crypto module
      console.log(chunk.toString()); // выводим step 2 - НАДО УБРАТЬ
      let json_req = JSON.parse(chunk); // распарсили наш json (откуда можно забирать данные) из ответа с crypto module в socket - chunk
      if (json_req.step == 2) { // проверяем что crypto module нам не выдал ошибку (иначе step был бы равен 0)
         // осуществляется проверка Captcha
         if (req.body.captcha === undefined || req.body.captcha === null || req.body.captcha === '') { // проверяется, 
            //вводилась ли captcha
            return res.status(400).json({ status: 400, success: false, msg: 'Please select captcha' }); // если нет, то отправляе ошибку
         }
         const secretKey = '6Lcg6GYfAAAAAHjRfZy4DPGfTeMoEPHV9wH0irQ7'; // secret key captcha

         // Verify URL - осуществляется проверка на стороне Google
         const query = stringify({ // формируются параметры для проверки
            secret: secretKey,
            response: req.body.captcha, // данные captcha
            remoteip: req.connection.remoteAddress
         });
         const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;
         const body = await fetch(verifyURL).then(res => res.json()); // Make a request to verifyURL

         // If not successful
         if (body.success !== undefined && !body.success) // если проверка пройдена не была, то отсылаем ошибку
            return res.status(400).json({ status: 400, success: false, msg: 'Failed captcha verification' });

         // If successful
         return res.status(200).json({ success: true, msg: 'Captcha OK', status: 200, data: json_req.data }); // передаем на 
         // сторону пользователя параметр status:200 - код состояния, статус обработки captcha (true) и в data передаем public key
      }
      else {
         res.status(400).json({ status: 400 }); // если неправильный логин, то отстреливаем status:400 
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
      console.log(chunk.toString()); // выводим step 4 - НАДО УБРАТЬ
      let json_req = JSON.parse(chunk); // распарсили наш json (откуда можно забирать данные) из ответа с crypto module в socket - chunk
      if ((json_req.step == 4) && json_req.data == "OK") { // для перехода при логине на следующую страницу создаем проверку:
         // 1) status = 200, ответ от crypto module в поле data = "OK"
         res.cookie('cookies', req.body["Password"], { // создаем cookie
            maxAge: 3600 * 24, // 24 hours
            secure: true,
            httpOnly: true,
            signed: true,
            sameSite: 'strict'
         });
         res.status(200).json({ cookie: 'successfull' }); // передаем на сторону пользователя параметр status:200
      }
      else {
         res.status(400).json(); // если проверка не прошла, то передаем status:400
      }
      client_2.end(); // закрываем соединение с crypto module
   });
});

// подключение страниц, к которым осуществляются обращения пользователем
app.get('/logout', (req, res) => { // подключается кнопка logout, и отправляем на сторону пользователя data:"OK" для перехода в корневую директорию
   res.clearCookie('cookies') // удаляем cookie
   res.send({ data: "OK", cookie: 'Clear' });
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

app.use(function (req, res, next) { // осуществляется проверка cookie
   if (req.signedCookies === undefined || Object.keys(req.signedCookies).length === 0) return res.redirect('/') // если cookie пустые,
   // то перенаправляем на главную страницу
   next();
});

app.use(express.static('public')); // подключаем папку public для обращения к страницам внутри нее

const sslServer = https.createServer({ // подключаем sslServer для работы https
   key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')), // ssl key (путь до него)
   cert: fs.readFileSync(path.join(__dirname, 'cert', 'ssl.pem')) // ssl certificate (путь до него)
}, app)

sslServer.listen(4333); // слушаем sslServer на 4333 порту 