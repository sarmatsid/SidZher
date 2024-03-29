[![Lint](https://github.com/sarmatsid/SidZher/actions/workflows/lint.yml/badge.svg)](https://github.com/sarmatsid/SidZher/actions/workflows/lint.yml)

# SidZher project

### RU Краткое описание
Данный проект создан в рамках магистерской диссертации Сергеем Сидориным и Александром Жердевым, большая часть описания этой работы будет на английском языке, поскольку он является международным языком. Диссертация посвящена авторизации и ауетентификации пользователя на веб-ресурсе при помощи ассиметричного шифрования. 

### EN Little description
This project was created as part of the master's thesis by Sidorin Sergey and Zherdev Alexander, most of the description of this work will be in English, since it is an international language, the dissertation is devoted to authorization and user authentication on a web resource using asymmetric encryption.


## Install and run

```shell
git clone https://github.com/sarmatsid/SidZher.git
cd SidZher
npm install
npm start
```


## How this works
```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Sidzher Crypto module
    participant Redis DB
    Client->>+Server: Login request
    Server->>+Sidzher Crypto module: Check user in database
    Sidzher Crypto module->>+Redis DB: User exist request
    Sidzher Crypto module->>+Sidzher Crypto module: Generate asymmetrick keys 
    Sidzher Crypto module->>+Server: Send encryption public key
    Server->>+Client: Send encryption key with script for encrypt
    Client->>+Server: Send encrypted password
    Server->>+Sidzher Crypto module: Send login and encrypted password
    Sidzher Crypto module->>+Sidzher Crypto module: Decrypt and hash password
    Sidzher Crypto module->>+Redis DB: Compare hashed password with password in db
    Redis DB->>+Sidzher Crypto module: OK/FAIL
    Sidzher Crypto module->>+Server: OK/FAIL
    Server->>+Client: OK/FAIL
```

### MITM Diagram
```mermaid
sequenceDiagram
    participant Client
    participant Hacker
    participant Server
    participant Sidzher Crypto module
    participant Redis DB
    Client->>+Server: Login request
    Server->>+Sidzher Crypto module: Check user in database
    Sidzher Crypto module->>+Redis DB: User exist request
    Sidzher Crypto module->>+Sidzher Crypto module: Generate asymmetrick keys 
    Sidzher Crypto module->>+Server: Send encryption public key
    Server->>+Client: Send encryption key with script for encrypt
    Client->>+Server: Send encrypted password
    Server->>+Sidzher Crypto module: Send login and encrypted password
    Sidzher Crypto module->>+Sidzher Crypto module: Decrypt and hash password
    Sidzher Crypto module->>+Redis DB: Compare hashed password with password in db
    Redis DB->>+Sidzher Crypto module: OK/FAIL
    Sidzher Crypto module->>+Server: OK/FAIL
    Server->>+Client: OK/FAIL
```

## Code flow

```mermaid
sequenceDiagram
    Front->>+/app/login: Login
    /app/login->>+Front: key
    Front->>+Front: Encrypt
    Front->>+/app/login_two: Encrypted password
    /app/login_two->>+Front: OK/FAIL
```

## Auth
### Basic
![Simple login](./images/before/login_request.png)

### Sidzher
![Login step 1](./images/after/login_request_step1.png)
![Login step 3](./images/after/login_request_step3.png)

## Register new user
### Basic
![Simple reg](./images/before/reg_request.png)
### SidZher
![Reg step 1](./images/after/reg_request_step1.png)
![Reg step 3](./images/after/reg_request_step3.png)

## Transfer type between server and Sidzher Crypto

### We use json, struct here:

```json
{
  "step": 1,
  "req_type": "<type>",
  "user": "<user>",
  "data": ""
}

```

`step` is used for phased synchronization between the server and SidZher crypto module

`req_type` can be `auth` or `reg`, where:

- `auth` - Used for authentificate users
- `reg` - Used for register new users

`user` field used for users login name

`data` field used for transfer public key, encrypted data and answer for login

# Links
[SidZher crypto](https://github.com/CNDspace/SidZher_crypto) - crypto module