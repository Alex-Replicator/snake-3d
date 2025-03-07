// Настройка управления змейкой
export function setupControls(snake, pauseCallback, menuCallback, toggleCameraCallback) {
    // Сброс существующих обработчиков (если настройка вызывается повторно)
    window.removeEventListener('keydown', handleKeyDown);
    
    // Функция обработчика нажатия клавиш
    function handleKeyDown(event) {
        switch(event.key) {
            // Управление по оси X и Z (стрелки)
            case 'ArrowUp':
                snake.setDirection(0, 0, -1);
                event.preventDefault();
                break;
            case 'ArrowDown':
                snake.setDirection(0, 0, 1);
                event.preventDefault();
                break;
            case 'ArrowLeft':
                snake.setDirection(-1, 0, 0);
                event.preventDefault();
                break;
            case 'ArrowRight':
                snake.setDirection(1, 0, 0);
                event.preventDefault();
                break;
                
            // Управление по оси Y (W/S и Ц/Ы в русской раскладке)
            case 'w':
            case 'W':
            case 'ц':
            case 'Ц':
                snake.setDirection(0, 1, 0);
                event.preventDefault();
                break;
            case 's':
            case 'S':
            case 'ы':
            case 'Ы':
                snake.setDirection(0, -1, 0);
                event.preventDefault();
                break;
                
            // Пауза (пробел)
            case ' ':
                pauseCallback();
                event.preventDefault();
                break;
                
            // Меню (ESC)
            case 'Escape':
                menuCallback();
                event.preventDefault();
                break;
                
            // Переключение режима камеры (C)
            case 'c':
            case 'C':
            case 'с':
            case 'С':
                if (toggleCameraCallback) {
                    toggleCameraCallback();
                }
                event.preventDefault();
                break;
                
            // Начать заново после проигрыша (Enter)
            case 'Enter':
                // Проверяем, виден ли экран Game Over
                const gameOverScreen = document.getElementById('game-over');
                if (gameOverScreen && !gameOverScreen.classList.contains('hidden')) {
                    // Нажимаем кнопку "Начать заново"
                    document.getElementById('restart-button').click();
                }
                event.preventDefault();
                break;
        }
    }
    
    // Добавление обработчика нажатия клавиш
    window.addEventListener('keydown', handleKeyDown);
    
    // Возвращаем функцию для отписки от событий (если нужно)
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
} 