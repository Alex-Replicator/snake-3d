import * as THREE from 'three';

// Настройка управления змейкой
export function setupControls(snake, pauseCallback, menuCallback, toggleCameraCallback, onRotateCallback) {
    // Сброс существующих обработчиков (если настройка вызывается повторно)
    window.removeEventListener('keydown', handleKeyDown);
    
    // Функция обработчика нажатия клавиш
    function handleKeyDown(event) {
        const key = event.key.toLowerCase();
        let angle = 0;
        
        // Обработка движения
        switch(key) {
            // Управление относительно направления головы змейки
            case 'w':
            case 'ц':
                angle = snake.changeRelativeDirection('up');
                event.preventDefault();
                break;
            case 's':
            case 'ы':
                angle = snake.changeRelativeDirection('down');
                event.preventDefault();
                break;
            case 'a':
            case 'ф':
                angle = snake.changeRelativeDirection('right');
                event.preventDefault();
                break;
            case 'd':
            case 'в':
                angle = snake.changeRelativeDirection('left');
                event.preventDefault();
                break;
            case 'q':
            case 'й':
                angle = snake.changeRelativeDirection('rotateLeft');
                event.preventDefault();
                break;
            case 'e':
            case 'у':
                angle = snake.changeRelativeDirection('rotateRight');
                event.preventDefault();
                break;
            
            // Остальные клавиши
            case ' ': // Пауза
                pauseCallback();
                event.preventDefault();
                break;
            case 'escape': // Меню
                menuCallback();
                event.preventDefault();
                break;
            case 'c': // Переключение камеры
            case 'с':
                if (toggleCameraCallback) {
                    toggleCameraCallback();
                }
                event.preventDefault();
                break;
            case 'enter': // Начать заново
                const gameOverScreen = document.getElementById('game-over');
                if (gameOverScreen && !gameOverScreen.classList.contains('hidden')) {
                    document.getElementById('restart-button').click();
                }
                event.preventDefault();
                break;
        }
        
        // Вызываем callback для синхронизации поворота камеры
        if (angle !== 0 && onRotateCallback) {
            onRotateCallback(angle);
        }
    }
    
    // Добавление обработчика нажатия клавиш
    window.addEventListener('keydown', handleKeyDown);
    
    // Возвращаем функцию для отписки от событий (если нужно)
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
} 