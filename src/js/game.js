// Импорт необходимых модулей
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Snake } from './snake.js';
import { Food } from './food.js';
import { setupControls } from './controls.js';
import { setupRenderer, createLights, createPlayField } from './renderer.js';

// Основной класс игры
class Game {
    constructor() {
        // Инициализация состояния игры
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.cameraMode = 'thirdPerson'; // Режим камеры по умолчанию
        
        // Настройка сцены Three.js
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        
        // Настройка камеры
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.camera.position.set(15, 15, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Создание рендерера
        this.renderer = setupRenderer();
        
        // Добавление элементов в сцену
        this.playField = createPlayField();
        this.scene.add(this.playField);
        
        // Добавление освещения
        this.lights = createLights();
        this.lights.forEach(light => this.scene.add(light));
        
        // Инициализация змейки и еды
        this.snake = null;
        this.food = null;
        
        // Настройка управления камерой (для отладки)
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = false; // Отключено по умолчанию
        
        // Параметры для плавного следования камеры
        this.cameraTarget = new THREE.Vector3(0, 0, 0);
        this.cameraOffset = new THREE.Vector3(15, 15, 15);
        this.cameraLerpFactor = 0.05; // Фактор плавности движения камеры
        
        // Параметры для управления мышью в режиме от первого лица
        this.mouseControl = {
            enabled: false,
            sensitivity: 0.002,
            yaw: 0,
            pitch: 0,
            pitchLimit: Math.PI / 3 // Ограничение угла наклона (60 градусов)
        };
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // Привязка элементов интерфейса
        this.bindUIElements();
        
        // Запускаем главный цикл игры
        this.animate();
    }
    
    // Запуск игры
    startGame() {
        // Получаем выбранный режим камеры
        const selectedOption = document.querySelector('.camera-option.selected');
        if (selectedOption) {
            this.cameraMode = selectedOption.dataset.mode;
        }
        
        // Обновляем индикатор режима камеры
        this.updateCameraIndicator();
        
        // Скрываем меню и показываем HUD
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        
        // Показываем подсказку для переключения камеры
        this.showCameraHint();
        
        // Инициализация или сброс состояния игры
        this.score = 0;
        document.getElementById('score-value').textContent = '0';
        
        // Удаление старой змейки и еды (если есть)
        if (this.snake) {
            this.snake.removeFromScene(this.scene);
        }
        if (this.food) {
            this.scene.remove(this.food.mesh);
        }
        
        // Создание новой змейки и еды
        this.snake = new Snake(this.scene);
        this.food = new Food(this.scene, this.playField);
        
        // Настройка управления
        setupControls(this.snake, this.pauseGame.bind(this), this.showMenu.bind(this), this.toggleCameraMode.bind(this));
        
        // Настройка камеры в зависимости от выбранного режима
        this.setupCamera();
        
        // Запуск игры
        this.isRunning = true;
        this.isPaused = false;
        
        // Включаем или отключаем управление мышью в зависимости от режима
        this.toggleMouseControl();
    }
    
    // Настройка камеры в зависимости от выбранного режима
    setupCamera() {
        if (this.cameraMode === 'firstPerson') {
            // Режим от первого лица - камера прикреплена к голове змейки
            this.camera.position.copy(this.snake.segments[0].mesh.position);
            this.camera.position.y += 0.5; // Немного выше центра головы
            
            // Направление камеры совпадает с направлением движения змейки
            const lookAtPosition = new THREE.Vector3().copy(this.snake.segments[0].mesh.position);
            lookAtPosition.add(this.snake.direction.clone().multiplyScalar(2));
            this.camera.lookAt(lookAtPosition);
            
            // Отключаем OrbitControls в режиме от первого лица
            this.controls.enabled = false;
            
            // Сбрасываем углы поворота камеры
            this.mouseControl.yaw = 0;
            this.mouseControl.pitch = 0;
        } else {
            // Режим от третьего лица - камера снаружи
            this.camera.position.set(15, 15, 15);
            this.cameraTarget.set(0, 0, 0); // Начальная точка фокуса
            this.camera.lookAt(this.cameraTarget);
            
            // Включаем OrbitControls только если пользователь хочет вращать камеру вручную
            this.controls.enabled = false;
        }
    }
    
    // Переключение режима камеры во время игры
    toggleCameraMode() {
        // Меняем режим камеры
        this.cameraMode = this.cameraMode === 'thirdPerson' ? 'firstPerson' : 'thirdPerson';
        
        // Обновляем индикатор режима камеры
        this.updateCameraIndicator();
        
        // Настраиваем камеру для нового режима
        this.setupCamera();
        
        // Включаем или отключаем управление мышью в зависимости от режима
        this.toggleMouseControl();
        
        // Показываем подсказку для переключения камеры
        this.showCameraHint();
    }
    
    // Обновление индикатора режима камеры
    updateCameraIndicator() {
        const indicator = document.getElementById('camera-mode-name');
        const iconSvg = document.querySelector('#camera-indicator .camera-icon svg');
        
        if (this.cameraMode === 'firstPerson') {
            indicator.textContent = 'От первого лица';
            // Обновляем SVG для режима от первого лица
            iconSvg.innerHTML = `
                <path fill="currentColor" d="M12,5C7.58,5,4,8.58,4,13v6h16v-6C20,8.58,16.42,5,12,5z M16.5,16C15.67,16,15,15.33,15,14.5 c0-0.83,0.67-1.5,1.5-1.5S18,13.67,18,14.5C18,15.33,17.33,16,16.5,16z"/>
                <path fill="currentColor" d="M12,2C11.45,2,11,2.45,11,3v4h2V3C13,2.45,12.55,2,12,2z"/>
            `;
        } else {
            indicator.textContent = 'Вид снаружи';
            // Обновляем SVG для режима от третьего лица
            iconSvg.innerHTML = `
                <path fill="currentColor" d="M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9S16.97,3,12,3z M12,19c-3.86,0-7-3.14-7-7s3.14-7,7-7s7,3.14,7,7 S15.86,19,12,19z"/>
                <path fill="currentColor" d="M12,9c-1.66,0-3,1.34-3,3s1.34,3,3,3s3-1.34,3-3S13.66,9,12,9z"/>
            `;
        }
    }
    
    // Показать подсказку для переключения камеры
    showCameraHint() {
        const hint = document.getElementById('camera-mode-hint');
        hint.classList.remove('fade-out');
        
        // Скрываем подсказку через 3 секунды
        setTimeout(() => {
            hint.classList.add('fade-out');
        }, 3000);
    }
    
    // Включение/отключение управления мышью
    toggleMouseControl() {
        // Включаем управление мышью только в режиме от первого лица
        this.mouseControl.enabled = (this.cameraMode === 'firstPerson');
        
        if (this.mouseControl.enabled) {
            // Блокируем указатель и добавляем обработчик движения мыши
            this.renderer.domElement.requestPointerLock = this.renderer.domElement.requestPointerLock || 
                                                         this.renderer.domElement.mozRequestPointerLock;
            this.renderer.domElement.requestPointerLock();
            
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        } else {
            // Освобождаем указатель и удаляем обработчик движения мыши
            document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
            document.exitPointerLock();
            
            document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        }
    }
    
    // Обработчик движения мыши для режима от первого лица
    handleMouseMove(event) {
        if (!this.mouseControl.enabled || !this.isRunning || this.isPaused) return;
        
        // Получаем движение мыши
        const movementX = event.movementX || event.mozMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || 0;
        
        // Обновляем углы поворота камеры
        this.mouseControl.yaw -= movementX * this.mouseControl.sensitivity;
        this.mouseControl.pitch -= movementY * this.mouseControl.sensitivity;
        
        // Ограничиваем угол наклона (pitch)
        this.mouseControl.pitch = Math.max(
            -this.mouseControl.pitchLimit,
            Math.min(this.mouseControl.pitchLimit, this.mouseControl.pitch)
        );
    }
    
    // Пауза игры
    pauseGame() {
        this.isPaused = !this.isPaused;
    }
    
    // Показать меню
    showMenu() {
        this.isRunning = false;
        
        // Отключаем управление мышью при выходе в меню
        if (this.mouseControl.enabled) {
            document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
            document.exitPointerLock();
        }
        
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
    }
    
    // Конец игры
    gameOver() {
        this.isRunning = false;
        
        // Отключаем управление мышью при окончании игры
        if (this.mouseControl.enabled) {
            document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
            document.exitPointerLock();
        }
        
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('final-score-value').textContent = this.score;
    }
    
    // Обновление игры на каждом кадре
    update() {
        if (this.isRunning && !this.isPaused) {
            // Обновление позиции змейки
            this.snake.update();
            
            // Обновление позиции камеры в зависимости от режима
            if (this.cameraMode === 'firstPerson') {
                this.updateFirstPersonCamera();
            } else {
                this.updateThirdPersonCamera();
            }
            
            // Обновление анимации еды
            if (this.food) {
                this.food.update();
            }
            
            // Проверка столкновения с едой
            if (this.snake.checkFoodCollision(this.food)) {
                // Увеличение змейки и обновление счета
                this.snake.grow();
                this.score++;
                document.getElementById('score-value').textContent = this.score;
                
                // Создание новой еды
                this.food.reposition(this.playField, this.snake);
            }
            
            // Проверка столкновения со стенами и с собой
            if (this.snake.checkWallCollision(this.playField) || this.snake.checkSelfCollision()) {
                this.gameOver();
            }
        }
    }
    
    // Обновление позиции камеры в режиме от третьего лица
    updateThirdPersonCamera() {
        if (this.snake && this.snake.segments.length > 0) {
            // Плавно перемещаем точку фокуса к голове змейки
            const headPosition = this.snake.segments[0].mesh.position.clone();
            this.cameraTarget.lerp(headPosition, this.cameraLerpFactor);
            
            // Вычисляем желаемую позицию камеры
            const desiredPosition = this.cameraTarget.clone().add(this.cameraOffset);
            
            // Плавно перемещаем камеру к желаемой позиции
            this.camera.position.lerp(desiredPosition, this.cameraLerpFactor);
            
            // Направляем камеру на точку фокуса
            this.camera.lookAt(this.cameraTarget);
        }
    }
    
    // Обновление позиции камеры в режиме от первого лица
    updateFirstPersonCamera() {
        if (this.snake && this.snake.segments.length > 0) {
            // Получаем позицию головы змейки
            const headPosition = this.snake.segments[0].mesh.position.clone();
            
            // Устанавливаем камеру немного выше головы
            headPosition.y += 0.5;
            this.camera.position.copy(headPosition);
            
            // Применяем углы поворота камеры от управления мышью
            if (this.mouseControl.enabled) {
                // Создаем кватернион для поворота камеры
                const quaternion = new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(
                        this.mouseControl.pitch,
                        this.mouseControl.yaw,
                        0,
                        'YXZ'
                    ));
                
                // Применяем поворот к направлению взгляда
                const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
                
                // Устанавливаем направление взгляда
                const lookAtPosition = this.camera.position.clone().add(direction);
                this.camera.lookAt(lookAtPosition);
                
                // Передаем направление взгляда для управления змейкой
                if (Math.abs(direction.x) > 0.5 || Math.abs(direction.z) > 0.5) {
                    // Нормализуем направление для горизонтальной плоскости
                    const horizontalDir = new THREE.Vector2(direction.x, direction.z).normalize();
                    
                    // Определяем основное направление движения
                    let newDirection;
                    if (Math.abs(horizontalDir.x) > Math.abs(horizontalDir.y)) {
                        newDirection = new THREE.Vector3(Math.sign(horizontalDir.x), 0, 0);
                    } else {
                        newDirection = new THREE.Vector3(0, 0, Math.sign(horizontalDir.y));
                    }
                    
                    // Обновляем направление змейки, если оно изменилось и не противоположно текущему
                    if (!this.snake.direction.equals(newDirection) && 
                        !this.snake.direction.clone().multiplyScalar(-1).equals(newDirection)) {
                        this.snake.changeDirection(newDirection);
                    }
                }
            } else {
                // Стандартное поведение - направление взгляда совпадает с направлением движения
                const lookAtPosition = headPosition.clone();
                lookAtPosition.add(this.snake.direction.clone().multiplyScalar(2));
                this.camera.lookAt(lookAtPosition);
            }
            
            // Добавляем небольшое покачивание камеры для эффекта движения
            const time = Date.now() * 0.001;
            const swayAmount = 0.05;
            this.camera.position.y += Math.sin(time * 5) * swayAmount;
            this.camera.position.x += Math.sin(time * 3) * swayAmount * 0.5;
        }
    }
    
    // Основной цикл анимации
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        this.update();
        
        // Обновляем контроллер камеры только если он включен
        if (this.controls.enabled) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // Обработчик изменения размера окна
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Привязка элементов интерфейса к обработчикам событий
    bindUIElements() {
        // Привязка выбора режима камеры в меню
        const cameraOptions = document.querySelectorAll('.camera-option');
        cameraOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Удаляем класс selected у всех опций
                cameraOptions.forEach(opt => opt.classList.remove('selected'));
                // Добавляем класс selected к выбранной опции
                option.classList.add('selected');
                // Выбираем соответствующий радио-кнопку
                const radioInput = option.querySelector('input[type="radio"]');
                if (radioInput) {
                    radioInput.checked = true;
                }
            });
        });
        
        // Кнопки меню
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('help-button').addEventListener('click', () => {
            document.getElementById('menu').classList.add('hidden');
            document.getElementById('help').classList.remove('hidden');
        });
        
        // Кнопки в экране окончания игры
        document.getElementById('restart-button').addEventListener('click', () => {
            document.getElementById('game-over').classList.add('hidden');
            this.startGame();
        });
        document.getElementById('menu-button').addEventListener('click', () => {
            document.getElementById('game-over').classList.add('hidden');
            document.getElementById('menu').classList.remove('hidden');
        });
        
        // Кнопка назад в экране помощи
        document.getElementById('back-button').addEventListener('click', () => {
            document.getElementById('help').classList.add('hidden');
            document.getElementById('menu').classList.remove('hidden');
        });
    }
}

// Инициализация игры при загрузке
window.onload = () => {
    const game = new Game();
}; 