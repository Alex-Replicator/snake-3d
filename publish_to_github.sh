#!/bin/bash
# Скрипт для публикации проекта на GitHub

# 1. Убедитесь, что вы находитесь в корневой директории проекта
cd "$(dirname "$0")"

# 2. Заполните переменные
GITHUB_USERNAME="Alex-Replicator"
REPO_NAME="snake-3d"

# 3. Добавим удалённый репозиторий
echo "Добавление удалённого репозитория..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# 4. Переименуем основную ветку в main (если это необходимо)
echo "Переименование основной ветки в main..."
git branch -M main

# 5. Отправим код на GitHub
echo "Отправка кода на GitHub..."
git push -u origin main

echo "Проект успешно опубликован на GitHub!"
echo "Ссылка на репозиторий: https://github.com/$GITHUB_USERNAME/$REPO_NAME" 