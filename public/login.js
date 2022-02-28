document.addEventListener("DOMContentLoaded", function () {

  async function reg(log, pas) {
    let publickey = undefined; // задаем переменную publickey 
    let responseStatus = undefined; // задаем переменную получаемого статуса с backend
    const captcha = document.querySelector('#g-recaptcha-response').value; // записываем значение, полученное при вводе captcha
    let captchaSuccess = undefined; // задаем переменную получаемого статуса captcha (заполена или нет / прошла проверку или нет)
    await fetch('/api/register_step1', { // передаем "Login": log на backend в post-формате в step 1
      // формируем post-запрос на backend
      method: "POST",
      body: JSON.stringify({ "Login": log, captcha }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => { // получаем ответ со стороны сервера (app.js)
        return res.text(); //возвращает новый promise, который выполняется и возвращает полный ответ сервера (app.js)
      })
      .then(res => { // возвращаемое  значение обработчика the выше передаётся дальше в следующий обработчик then
        publickey = JSON.parse(res)["data"]; // принимаем со стороны backend json, откуда парсим поле data, где лежит public key
        responseStatus = JSON.parse(res)["status"]; // принимаем со стороны backend json, откуда парсим поле status, где лежит код состояния
        captchaSuccess = JSON.parse(res)["success"]
      })
      .catch(res => { // оператор catch определяет блок кода для обработки любой ошибки
        console.log("Exception : ", res);
      })
    if (captchaSuccess === false) { // если captcha не введена, то выводим false
      return false; // возвращаем из всей функции статус false
    } else {
      if (responseStatus === 200) { // если все хорошо и код состояния = 200, тогда шифруем...
        let crypt = new JSEncrypt(); // создаем экземпляр объекта библиотеки для шифрования
        crypt.setPublicKey(publickey); // передаём объекту библиотеки шифрования публичный ключ, который является текстовой строкой(string)
        let cryptoData = crypt.encrypt(pas); // в этой переменной текст (pas), который был зашифрован шифрован publickey
        let result = await fetch('/api/register_step3', { // передаем ""Login": log, "Password": cryptoData" на backend в post-формате в step 3
          method: "POST",
          body: JSON.stringify({ "Login": log, "Password": cryptoData }),
          headers: { 'Content-Type': 'application/json' }
        })
        return result["status"]; // если при step 4 все удачно и мы получаем от backend status:200, то мы выдаем status:200 ->
        // далее это будет как res == 200
      } else {
        return 400; // иначе res == 400
      }
    }
  }

  const regButton = document.querySelector(".regBut"); // создаем кнопку regButton с классом regBut,
  // к которому мы обращаемся в index.html, чтобы работала вся логика, описанная ниже
  if (regButton != undefined) {
    regButton.onclick = async function () { // прописывается логика в случае нажатия на кнопку
      const messages = document.querySelector(".mess"); // создаем класс mess, к котрому в дальнейшем обращаемся в index.html, чтобы отрабатывала прописанная ниже логика
      const loginText = document.querySelector(".logText"); // создаем класс logText, к котрому в дальнейшем обращаемся в index.html, чтобы отрабатывала прописанная ниже логика
      const passwordText = document.querySelector(".passText"); // создаем класс passText, к котрому в дальнейшем обращаемся в index.html, чтобы отрабатывала прописанная ниже логика
      let passregexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,20}$/; // создаем переменную, где задаем регуляркой услвоия для создания пароля
      // а именно д.б.: спец. символ, заглавная буква, строчная буква, цифра 
      if ((loginText.value != '') && (passwordText.value != '')) { // если логин или пароль - это не пустой текст
        if (passwordText.value.match(passregexp)) { // если соответсвует политике создания пароля
          let res = await reg(loginText.value, passwordText.value); // отсюда возвращаем значение из функции reg - что возвращается в return - status code
          if (res != false) { // условие если введена captcha
            if (res != 200) { // здесь используется статус из функции reg выше, где мы по прошествии всех 4 шагов получаем итоговый status - 200 или 400
              messages.textContent = "Такой пользователь уже существует"; // если status != 200 - значит такой пользователь уже существует
            } else {
              window.location.href = "HW_2.html"; // иначе направляе  на главную страницу сайта
            }
          } else { // если captcha не введена
            messages.textContent = "Введите Captcha";
          }
        } else { // если политика создания пароля не выполнена, то выводим текст ошибки пользователю
          messages.textContent = "Не соответствует политике создания пароля";
        }
      } else { // если либо поле логина, либо поле пароля пустое
        messages.textContent = "Логин и пароль не могут быть пустыми";
      }
      // очищаем поля ввода логина и пароля
      loginText.value = '';
      passwordText.value = '';
    }
  }

  async function login(log, pas) { // создаем функцию login, в которой будут передаваться 2 параметра - log (loginText.value) и pas (passwordText.value)
    let publickey = undefined; // задаем переменную publickey 
    let responseStatus = undefined; // задаем переменную получаемого статуса с backend
    const captcha = document.querySelector('#g-recaptcha-response').value; // записываем значение, полученное при вводе captcha
    let captchaSuccess = undefined; // задаем переменную получаемого статуса captcha (заполена или нет / прошла проверку или нет)
    await fetch('/api/login_step1', { // передаем ""Login": log" на backend в post-формате в step 1
      // формируем post-запрос на backend
      method: "POST",
      body: JSON.stringify({ "Login": log, captcha }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        return res.text();
      })
      .then(res => {
        publickey = JSON.parse(res)["data"]; // принимаем со стороны backend json, откуда парсим поле data, где лежит public key
        responseStatus = JSON.parse(res)["status"]; // принимаем со стороны backend json, откуда парсим поле status, где лежит код состояния
        captchaSuccess = JSON.parse(res)["success"] // парсим status при вводе captcha (true / false)
      })
      .catch(res => { // оператор catch определяет блок кода для обработки любой ошибки
        console.log("Exception : ", res);
      })
    if (captchaSuccess === false) { // если captcha не введена, то выводим false
      return false; // возвращаем из всей функции статус false
    } else { // если captcha введена
      if (responseStatus === 200) { // если все хорошо и код состояния = 200, тогда шифруем pas - полученный пароль (passwordText.value)
        let crypt = new JSEncrypt(); // создаем экземпляр объекта библиотеки для шифрования
        crypt.setPublicKey(publickey); // передаём объекту библиотеки шифрования публичный ключ, который является текстовой строкой(string)
        let cryptoData = crypt.encrypt(pas); // в этой переменной текст (pas), который был зашифрован publickey
        let result = await fetch('/api/login_step3', { // передаем ""Login": log, "Password": cryptoData" на backend в post-формате в step 3
          method: "POST",
          body: JSON.stringify({ "Login": log, "Password": cryptoData }),
          headers: { 'Content-Type': 'application/json' }
        })
        return result["status"]; // если при step 4 все удачно и мы получаем от backend status:200, то мы выдаем status:200 ->
        // далее это будет как res == 200
      } else {
        return 400; // иначе res == 400
      }
    }
  }

  const logButton = document.querySelector(".logBut"); // создаем кнопку logButton с классом logBut, 
  // к которому мы обращаемся в index.html, чтобы работала вся логика, описанная ниже
  if (logButton != undefined) {
    logButton.onclick = async function () { // прописывается логика в случае нажатия на кнопку
      const messages = document.querySelector(".mess"); // создаем класс mess, к котрому в дальнейшем обращаемся в index.html, чтобы отрабатывала прописанная ниже логика
      const loginText = document.querySelector(".logText"); // создаем класс logText, к котрому в дальнейшем обращаемся в index.html, чтобы отрабатывала прописанная ниже логика
      const passwordText = document.querySelector(".passText"); // создаем класс passText, к котрому в дальнейшем обращаемся в index.html, чтобы отрабатывала прописанная ниже логика
      if ((loginText.value != '') && (passwordText.value != '')) { // если логин или пароль - это не пустой текст
        let res = await login(loginText.value, passwordText.value); // отсюда возвращаем значение из функции login - что возвращается в return - status code
        if (res != false) { // условие если введена captcha
          if (res != 200) { // здесь используется статус из функции login выше, где мы по прошествии всех 4 шагов получаем итоговый status - 200 или 400
            messages.textContent = "Неверный логин или пароль"; // выводим на экран ошибку, если status != 200
          } else {
            window.location.href = 'HW_2.html'; // иначе открываем страницу сайта
          }
        } else { // если captcha не введена
          messages.textContent = "Введите Captcha";
        }
      } else { // если либо поле логина, либо поле пароля пустое
        messages.textContent = "Логин и пароль не могут быть пустыми"; // выводим текст с ошибкой
      }
      // очищаем поля ввода логина и пароля
      loginText.value = '';
      passwordText.value = '';
    }
  }

  const logOutButton = document.querySelector(".logout"); // создаем кнопку logOutButton с классом logout
  // к которому мы обращаемся во всех страницах внутри сайта, чтобы работала вся логика, описанная ниже (разлогинивание)
  if (logOutButton != undefined) {
    logOutButton.onclick = async function () { // прописывается логика в случае нажатия на кнопку
      fetch("/logout", { // отправляется GET-запрос на сервер для перехода на страницу index.html
        method: 'GET',
        headers: { "Content-Type": "application/json" }
      })
        .then(res => {
          return res.text();
        })
        .then(res => { // получаем ответ от app.js, где data: "OK" и в итоге переходим на стартовую страницу index.html
          if (JSON.parse(res)["data"] == "OK") {
            document.location.href = '/';
          }
        })
        .catch(res => { // оператор catch определяет блок кода для обработки любой ошибки
          console.log("Exception : ", res);
        });
    }
  }
})
