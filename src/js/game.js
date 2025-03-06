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
        const cameraModeInputs = document.getElementsByName('camera-mode');
        for (const input of cameraModeInputs) {
            if (input.checked) {
                this.cameraMode = input.value;
                break;
            }
        }
        
        // Скрываем меню и показываем HUD
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        
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
        setupControls(this.snake, this.pauseGame.bind(this), this.showMenu.bind(this));
        
        // Настройка камеры в зависимости от выбранного режима
        this.setupCamera();
        
        // Запуск игры
        this.isRunning = true;
        this.isPaused = false;
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
        } else {
            // Режим от третьего лица - камера снаружи
            this.camera.position.set(15, 15, 15);
            this.cameraTarget.set(0, 0, 0); // Начальная точка фокуса
            this.camera.lookAt(this.cameraTarget);
            
            // Включаем OrbitControls только если пользователь хочет вращать камеру вручную
            this.controls.enabled = false;
        }
    }
    
    // Пауза игры
    pauseGame() {
        this.isPaused = !this.isPaused;
    }
    
    // Показать меню
    showMenu() {
        this.isRunning = false;
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
    }
    
    // Конец игры
    gameOver() {
        this.isRunning = false;
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
            
            // Направление взгляда совпадает с направлением движения
            const lookAtPosition = headPosition.clone();
            lookAtPosition.add(this.snake.direction.clone().multiplyScalar(2));
            this.camera.lookAt(lookAtPosition);
            
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