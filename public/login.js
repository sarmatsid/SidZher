document.addEventListener("DOMContentLoaded", function () {

  async function login(log, pas) {
    // let asdf = undefined;
    // let response = undefined;
    let result = await fetch('/api/login', {
      method: "POST",
      body: JSON.stringify({ "Login": log, "Password": pas }),
      headers: { 'Content-Type': 'application/json' }
    })

    // .then(res => {
    //   return res.text();
    // })
    //   .then(res => {
    //     asdf = JSON.parse(res)["data"]
    //     response = JSON.parse(res)["status"]
    //   })


    let response = result["status"]
    return response
  }

  const logButton = document.querySelector(".logButton")
  if (logButton != undefined) {
    logButton.onclick = async function () {
      const messages = document.querySelector(".messages")
      const loginText = document.querySelector(".loginText")
      const passwordText = document.querySelector(".passwordText")

      if ((loginText.value != '') && (passwordText.value != '')) {
        let res = await login(loginText.value, passwordText.value)
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
    let result = await fetch('/api/register', {
      method: "POST",
      body: JSON.stringify({ "Login": log, "Password": pas }),
      headers: { 'Content-Type': 'application/json' }
    })
    let response = result["status"]
    return response
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
