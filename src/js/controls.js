// Настройка управления змейкой
export function setupControls(snake, pauseCallback, menuCallback) {
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
                
            // Управление по оси Y (W/S)
            case 'w':
            case 'W':
                snake.setDirection(0, 1, 0);
                event.preventDefault();
                break;
            case 's':
            case 'S':
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
        }
    }
    
    // Добавление обработчика нажатия клавиш
    window.addEventListener('keydown', handleKeyDown);
    
    // Возвращаем функцию для отписки от событий (если нужно)
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
} 