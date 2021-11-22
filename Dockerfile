FROM php:8.0-apache

RUN a2enmod rewrite
RUN service apache2 restart
RUN docker-php-ext-install pdo pdo_mysql && docker-php-ext-enable pdo_mysql
