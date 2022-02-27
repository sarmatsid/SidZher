document.addEventListener("DOMContentLoaded", function () {

  async function login(log, pas) { // создаем функцию login, в которой будут передаваться 2 параметра - log и pas
    let publickey = undefined; // задаем переменную publickey 
    let responseStatus = undefined; // задаем переменную получаемого статуса с backend
    await fetch('/api/login_step1', { // передаем "Login": log на backend в post-формате в step 1
      // формируем post-запрос на backend
      method: "POST",
      body: JSON.stringify({ "Login": log }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        return res.text();
      })
      .then(res => {
        publickey = JSON.parse(res)["data"] // принимаем со стороны backend json, откуда парсим поле data, где лежит public key
        responseStatus = JSON.parse(res)["status"] // принимаем со стороны backend json, откуда парсим поле status, где лежит код состояния
      })
    if (responseStatus === 200) { // если все хорошо и код состояния = 200, тогда шифруем...
      var crypt = new JSEncrypt(); // Создаем экземпляр объекта библиотеки для шифрования
      crypt.setPublicKey(publickey); // Передаём объекту библиотеки шифрования публичный ключ, который является текстовой строкой(string)
      var cryptoData = crypt.encrypt(pas); // В этой переменной текст, который будем шифровать

      let result = await fetch('/api/login_step3', { //
        method: "POST",
        body: JSON.stringify({ "Login": log, "Password": cryptoData }),
        headers: { 'Content-Type': 'application/json' }
      })
      return result["status"]
    } else {
      return 400;
    }
  }

  const logButton = document.querySelector(".logButton")
  if (logButton != undefined) {
    logButton.onclick = async function () {
      const messages = document.querySelector(".messages")
      const loginText = document.querySelector(".loginText")
      const passwordText = document.querySelector(".passwordText")

      if ((loginText.value != '') && (passwordText.value != '')) {
        let res = await login(loginText.value, passwordText.value) // отсюда возвращаем значение из функции login - что возвращается в return - status code
        if (res != 200) {
          messages.textContent = "Неверный логин или пароль"
        } else {
          window.location.href = 'HW_2.html';
        }
      } else {
        messages.textContent = "Логин и пароль не могут быть пустыми"
      }
      loginText.value = ''
      passwordText.value = ''
    }
  }

  const logOutButton = document.querySelector(".logout")
  if (logOutButton != undefined) {
    logOutButton.onclick = async function () {
      fetch("http://localhost:3000/logout/", {
        method: 'GET',
        headers: { "Content-Type": "application/json" }
      })
        .then(res => {
          return res.text();
        })
        .then(res => {
          if (JSON.parse(res)["data"] == "OK") {
            document.location.href = 'http://localhost:3000'
          }
        })
        .catch(res => {
          console.log("Exception : ", res);
        });
    }
  }

  async function reg(log, pas) {
    let publickey = undefined; // задаем переменную publickey 
    let responseStatus = undefined; // задаем переменную получаемого статуса с backend
    await fetch('/api/register_step1', { // передаем "Login": log на backend в post-формате в step 1
      // формируем post-запрос на backend
      method: "POST",
      body: JSON.stringify({ "Login": log }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        return res.text();
      })
      .then(res => {
        publickey = JSON.parse(res)["data"] // принимаем со стороны backend json, откуда парсим поле data, где лежит public key
        responseStatus = JSON.parse(res)["status"] // принимаем со стороны backend json, откуда парсим поле status, где лежит код состояния
      })
    if (responseStatus === 200) { // если все хорошо и код состояния = 200, тогда шифруем...
      var crypt = new JSEncrypt(); // Создаем экземпляр объекта библиотеки для шифрования
      crypt.setPublicKey(publickey); // Передаём объекту библиотеки шифрования публичный ключ, который является текстовой строкой(string)
      var cryptoData = crypt.encrypt(pas); // В этой переменной текст, который будем шифровать

      let result = await fetch('/api/register_step3', { //
        method: "POST",
        body: JSON.stringify({ "Login": log, "Password": cryptoData }),
        headers: { 'Content-Type': 'application/json' }
      })
      return result["status"]
    } else {
      return 400;
    }
  }

  const regButton = document.querySelector(".regButton")
  if (regButton != undefined) {
    regButton.onclick = async function () {
      const messages = document.querySelector(".messages")
      const loginText = document.querySelector(".loginText")
      const passwordText = document.querySelector(".passwordText")
      var passregexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,20}$/;
      if ((loginText.value != '') && (passwordText.value != '')) {
        if (passwordText.value.match(passregexp)) {
          let res = await reg(loginText.value, passwordText.value)
          if (res != 200) {
            messages.textContent = "Такой пользователь уже существует"
          } else {
            window.location.href = "HW_2.html"
          }
        } else {
          messages.textContent = "Не соответствует политике создания пароля"
        }
      } else {
        messages.textContent = "Логин и пароль не могут быть пустыми";
      }
      loginText.value = '';
      passwordText.value = '';
    }
  }

  //   function get() {
  //     fetch("http://localhost:3000/get/", {
  //       method: 'GET', headers: { "Content-Type": "application/json" }
  //     })
  //       .then(res => {
  //         console.log("res1", res)
  //         return res.text();
  //       })
  //       .then(res => {
  //         console.log("res2", res)
  //         console.log("parse", JSON.parse(res)["data"])
  //       })
  //       .catch(res => {
  //         console.log("Exception : ", res);
  //       });
  // }

})
