<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>Форма регистрации</title>
	<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css">
	<script src="https://www.google.com/recaptcha/api.js"></script>
</head>
<body>
	<div class="container mt-4">
		<?php
			if($_COOKIE['user'] == ''):
		?>
		<div class="row">
			<div class="col">
				<h1>Форма регистрации</h1>
				<form  action="validation-form/check.php" method="post">
				<input type="text" class="form-control" name="login" id="login" placeholder="Введите логин"><br>
				<input type="password" class="form-control" name="pass" id="pass" placeholder="Введите пароль"><br>
				<button class="btn btn-success" type="submit">Зарегистрироваться</button>
				</form>
			</div>
			<div class="col">
				<h1>Форма авторизации</h1>
				<form  action="validation-form/auth.php" method="post">
				<input type="text" class="form-control" name="login" id="login" placeholder="Введите логин"><br>
				<input type="password" class="form-control" name="pass" id="pass" placeholder="Введите пароль"><br>
				<div class="g-recaptcha" data-type="image" data-sitekey="6LddKkodAAAAALzjQuqBjhoHt3hTR3LJMER18vVT"></div>
				<button class="btn btn-success" type="submit">Авторизоваться</button>
				</form>
			</div>
		<?php else: ?>
			<p>Привет, <?=$_COOKIE['user']?>Чтобы выйти нажмите <a href="/exit.php">здесь</a>.</p>
		<?php endif;?>
		</div>	
	</div>
</body>
</html>
