<?php 
    $login = filter_var(trim($_POST['login']),
    FILTER_SANITIZE_STRING);
    $pass = filter_var(trim($_POST['pass']),
    FILTER_SANITIZE_STRING);

    $options = [
    'cost' => 12,
    'salt' => uniqid(mt_rand(), true),
     ];
	$pass_enc = password_hash($pass, PASSWORD_BCRYPT, $options);

    $mysql = new mysqli('localhost', 'debian-sys-maint', 'XFlgqlVQ63z4Ec9L', 'register-bd');
    $user_result = $mysql->query("SELECT `login` FROM `users` WHERE `login` = '$login'");
    $user = $user_result->fetch_assoc();
    if ($user['login'] == $login) {
        echo "Такой пользователь уже существует";
    }
    else {
        if (mb_strlen($login) < 2 || mb_strlen($login) > 90) {
            echo "Недопустимая длина логина";
            exit();
        }     
        if (mb_strlen($pass) < 2)  {
            echo "Недопустимая длина пароля (от 8 до 12 символов)";
            exit();    
        }
        if (! preg_match('~[a-zа-яё]~', $pass)) {
            echo "Нет букв в пароле";
            exit();
        }   
        if (! preg_match('~[A-ZА-ЯЁ]~', $pass)) {
            echo "Нет заглавных букв в пароле";
            exit();
        }      
        if (! preg_match('/([0-9]+)/', $pass)) {
            echo "Нет цифр в пароле";
            exit();
        }       
        if (! preg_match("/[<>`:;|?!@#$%^&*()_+]/", $pass)) {
            echo "Нет специальных символов в пароле";
            exit();
        }   
        $mysql->query("INSERT INTO `users` (`login`, `pass`) VALUES('$login', '$pass_enc')");
        header('Location: /');
    }
    $mysql->close();
?>
