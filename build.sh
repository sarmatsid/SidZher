#!/bin/bash
# может понадобится преоьразовать файл из Windows формата в Линукс, для этого понадобится установить утилиту и воспользоваться ею:
# sudo apt install dos2unix
# dos2unix build.sh
# запускаю командой sh build.sh

# sudo nano /etc/apache2/sites-available/SidZher_https.conf
# <VirtualHost *:443>
    # ServerName localhost
	# DocumentRoot /var/www/SidZher
	# SSLEngine on
    # SSLCertificateFile "/home/localhost.crt"
	# SSLCertificateKeyFile "/home/localhost.key"
    # ErrorLog ${APACHE_LOG_DIR}/error.log
    # CustomLog ${APACHE_LOG_DIR}/access.log combined
	# <Directory /var/www/SidZher>
		# AllowOverride all
	# </Directory>
# </VirtualHost>


set -e
sudo apt update -y && apt upgrade && apt full-upgrade -y && apt dist-upgrade && apt autoremove -y && apt autoclean -y && apt clean -y 
sudo apt install apache2 git php libapache2-mod-php php-mysql -y mysql-server -y phpmyadmin -y
sudo systemctl enable apache2
sudo systemctl enable mysql
sudo systemctl start apache2
sudo a2enmod expires headers rewrite ssl
sudo systemctl restart apache2
git clone /home/sidzher/SidZher /var/www/SidZher
sudo ln -s /usr/share/phpmyadmin /var/www/SidZher/
sudo chown -R $USER:$USER /var/www/SidZher
sudo a2dissite 000-default
sudo apache2ctl configtest
sudo systemctl reload apache2
sudo openssl req -x509 -days 365 -newkey rsa:2048 -keyout /home/localhost.key -out /home/localhost.crt


sudo a2ensite SidZher_https.conf
systemctl restart apache2
sudo apt update -y && apt upgrade && apt full-upgrade -y && apt dist-upgrade && apt autoremove -y && apt autoclean -y && apt clean -y 
cat /etc/mysql/debian.cnf

# cat /etc/mysql/debian.cnf - логин и пароль для phpmyadmin
# В БД создаем БД register-bd -> в ней таблицу users -> в ней 3 строки: id (int, поставить галочку под A_I), login (var, длина 100), pass (var, длина 1000)