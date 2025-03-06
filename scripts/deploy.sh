#!/bin/bash
# Скрипт для деплоя Snake 3D на VPS

set -e  # Остановка при ошибке

# Переменные
DEPLOY_DIR=/var/www/snake3d
DOCKER_COMPOSE_FILE=/path/to/docker-compose.yml
NGINX_CONTAINER=snake3d_nginx
BACKUP_DIR=/var/backups/snake3d

# Создание бэкапа текущей версии
echo "Создание бэкапа текущей версии..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
if [ -d "$DEPLOY_DIR" ] && [ "$(ls -A $DEPLOY_DIR)" ]; then
    mkdir -p $BACKUP_DIR
    tar -czf $BACKUP_DIR/snake3d_$TIMESTAMP.tar.gz $DEPLOY_DIR
    echo "Бэкап создан: $BACKUP_DIR/snake3d_$TIMESTAMP.tar.gz"
fi

# Очистка и подготовка директории
echo "Подготовка директории деплоя..."
mkdir -p $DEPLOY_DIR
rm -rf $DEPLOY_DIR/*

# Распаковка новой версии
echo "Распаковка новой версии..."
if [ -f "dist.tar.gz" ]; then
    tar -xzf dist.tar.gz -C $DEPLOY_DIR
    rm dist.tar.gz
    echo "Новая версия распакована в $DEPLOY_DIR"
else
    echo "Ошибка: Файл dist.tar.gz не найден!"
    exit 1
fi

# Перезапуск сервисов
echo "Перезапуск сервисов..."
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
    cd $(dirname $DOCKER_COMPOSE_FILE)
    docker-compose restart $NGINX_CONTAINER
    echo "Nginx перезапущен"
else
    echo "Предупреждение: Docker Compose файл не найден, перезапуск не выполнен"
fi

echo "Деплой успешно завершен!" 