import * as THREE from 'three';

// Класс для еды в игре
export class Food {
    constructor(scene, playField) {
        // Настройки еды
        this.size = 0.8; // Размер еды (немного меньше змейки)
        this.rotationSpeed = 0.02; // Скорость вращения
        this.floatSpeed = 0.005; // Скорость левитации
        this.floatAmplitude = 0.3; // Амплитуда левитации
        this.initialY = 0; // Начальная позиция по Y
        this.floatOffset = 0; // Смещение для функции синуса
        
        // Создание геометрии и материала для еды
        this.geometry = new THREE.SphereGeometry(this.size / 2, 16, 16);
        this.material = new THREE.MeshPhongMaterial({ 
            color: 0xF44336,
            emissive: 0xE57373,
            emissiveIntensity: 0.5,
            shininess: 100
        });
        
        // Создание меша
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        
        // Добавление в сцену
        scene.add(this.mesh);
        
        // Перемещение еды в случайную позицию
        this.reposition(playField);
    }
    
    // Перемещение еды в случайную позицию
    reposition(playField, snake = null) {
        const halfSize = playField.geometry.parameters.width / 2 - this.size;
        let position;
        let isColliding;
        
        // Поиск позиции, не пересекающейся со змейкой
        do {
            isColliding = false;
            
            // Случайная позиция внутри игрового поля
            position = new THREE.Vector3(
                Math.floor(Math.random() * (halfSize * 2)) - halfSize,
                Math.floor(Math.random() * (halfSize * 2)) - halfSize,
                Math.floor(Math.random() * (halfSize * 2)) - halfSize
            );
            
            // Проверка пересечения со змейкой (если она передана)
            if (snake) {
                for (const segment of snake.segments) {
                    if (position.distanceTo(segment.position) < this.size + snake.size) {
                        isColliding = true;
                        break;
                    }
                }
            }
        } while (isColliding);
        
        // Округление до целых значений для сетки
        position.x = Math.round(position.x);
        position.y = Math.round(position.y);
        position.z = Math.round(position.z);
        
        // Установка позиции
        this.mesh.position.copy(position);
        this.initialY = position.y;
        this.floatOffset = Math.random() * Math.PI * 2; // Случайная начальная фаза
    }
    
    // Обновление анимации (вызывается в основном цикле)
    update() {
        // Вращение еды
        this.mesh.rotation.y += this.rotationSpeed;
        
        // Левитация еды (движение вверх-вниз)
        this.floatOffset += this.floatSpeed;
        this.mesh.position.y = this.initialY + Math.sin(this.floatOffset) * this.floatAmplitude;
    }
} 