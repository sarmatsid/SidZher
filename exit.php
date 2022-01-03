<?php
	setcookie('user', 'Dear user', time() - 3600, "/");
	header('Location: /');
?>
