<?php
    $login = filter_var(trim($_POST['login']),
    FILTER_SANITIZE_STRING);
    $pass = filter_var(trim($_POST['pass']),
    FILTER_SANITIZE_STRING);


    if ( !$_POST['g-recaptcha-response'] )
       exit('Заполните Captcha');

    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $key = '6LddKkodAAAAAGzse4USLHw8Agn4k98bWdkxBnTz';
    $query = $url.'?secret='.$key.'&response='.$_POST['g-recaptcha-response'].'&remoteip='.$SERVER['REMOTE_ADDR'];

    $data = json_decode(file_get_contents($query));

    if ( $data->success == false)
        exit('Captcha введена неверно');

    $mysql = new mysqli('localhost', 'debian-sys-maint', 'XFlgqlVQ63z4Ec9L', 'register-bd');
    $user_result = $mysql->query("SELECT `login` FROM `users` WHERE `login` = '$login'");
    $pass_result = $mysql->query("SELECT `pass` FROM `users` WHERE `login` = '$login'");
    $pass_result_db = $pass_result->fetch_assoc();
    $user = $user_result->fetch_assoc();
    if ($user['login'] == $login) {
        if (password_verify($pass, $pass_result_db['pass'])) {
            setcookie('user', 'Dear user. ', time() + 3600, "/");
            header('Location: /');
        }
        else {
            echo "Неверный пароль";
        }
    }
    else {
        echo "Такой пользователь не найден";
    }  
    $mysql->close();
?>


