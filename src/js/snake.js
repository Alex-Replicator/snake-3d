import * as THREE from 'three';

// Класс змейки
export class Snake {
    constructor(scene) {
        // Настройки змейки
        this.size = 1; // Размер сегмента змейки
        this.initialSize = 3; // Начальная длина змейки
        this.speed = 2; // Скорость движения
        this.lastUpdateTime = 0; // Время последнего обновления
        this.movementProgress = 0; // Прогресс движения для плавной анимации
        
        // Направление движения (x, y, z)
        this.direction = new THREE.Vector3(1, 0, 0);
        this.nextDirection = new THREE.Vector3(1, 0, 0);
        
        // Базовые векторы для вычисления относительных направлений
        this.up = new THREE.Vector3(0, 1, 0);
        this.right = new THREE.Vector3(0, 0, 1);
        
        // Массив сегментов змейки (голова - первый элемент)
        this.segments = [];
        
        // Создание материала для змейки (красный вместо зеленого)
        this.material = new THREE.MeshLambertMaterial({ color: 0xF44336 });
        this.headMaterial = new THREE.MeshLambertMaterial({ color: 0xD32F2F });
        
        // Создание геометрии для сегментов
        this.geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        
        // Сохраняем ссылку на сцену для дальнейшего использования
        this.scene = scene;
        
        // Создание начальных сегментов
        this.createInitialSegments(scene);
    }
    
    // Создание начальных сегментов змейки
    createInitialSegments(scene) {
        for (let i = 0; i < this.initialSize; i++) {
            const mesh = new THREE.Mesh(
                this.geometry,
                i === 0 ? this.headMaterial : this.material
            );
            
            // Позиция сегмента (начинаем с центра, уходя влево)
            mesh.position.set(-i, 0, 0);
            
            this.segments.push({
                mesh: mesh,
                position: new THREE.Vector3(-i, 0, 0)
            });
            
            scene.add(mesh);
        }
    }
    
    // Изменение направления движения относительно текущего направления
    changeRelativeDirection(direction) {
        // Создаем вектор "вперед" на основе текущего направления
        const forward = this.direction.clone().normalize();
        
        // Создаем вектор "вверх" (по умолчанию глобальный вверх)
        const up = new THREE.Vector3(0, 1, 0);
        
        // Если движемся вертикально, используем Z как базу
        if (Math.abs(forward.y) > 0.9) {
            up.set(0, 0, Math.sign(forward.y));
        }
        
        // Вычисляем вектор "вправо"
        const right = up.clone().cross(forward).normalize();
        
        // Обновляем "вверх" чтобы он был точно перпендикулярен
        up.crossVectors(forward, right).normalize();
        
        let newDirection = null;
        
        switch(direction) {
            case 'up':
                newDirection = up;
                break;
            case 'down':
                newDirection = up.clone().multiplyScalar(-1);
                break;
            case 'left':
                newDirection = right.clone().multiplyScalar(-1);
                break;
            case 'right':
                newDirection = right;
                break;
            case 'rotateLeft':
                newDirection = forward.clone().cross(up).normalize().multiplyScalar(-1);
                break;
            case 'rotateRight':
                newDirection = forward.clone().cross(up).normalize();
                break;
        }
        
        if (newDirection) {
            // Округляем компоненты вектора до целых чисел
            newDirection.x = Math.round(newDirection.x);
            newDirection.y = Math.round(newDirection.y);
            newDirection.z = Math.round(newDirection.z);
            
            // Нормализуем после округления
            newDirection.normalize();
            
            // Проверяем, что новое направление не противоположно текущему
            if (this.direction.dot(newDirection) !== -1) {
                this.direction.copy(newDirection);
                this.nextDirection.copy(newDirection);
                
                // Возвращаем угол поворота для синхронизации камеры
                const angle = Math.atan2(
                    this.direction.x * forward.z - this.direction.z * forward.x,
                    this.direction.x * forward.x + this.direction.z * forward.z
                );
                return angle;
            }
        }
        return 0;
    }
    
    // Обновление позиции змейки
    update() {
        const now = performance.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000; // Переводим в секунды
        
        // Обновляем прогресс движения
        this.movementProgress += deltaTime * this.speed;
        
        // Если достигли следующей позиции
        if (this.movementProgress >= 1) {
            this.movementProgress = 0;
            this.lastUpdateTime = now;
            
            // Сохраняем предыдущие позиции
            const prevPositions = this.segments.map(segment => 
                segment.position.clone()
            );
            
            // Обновляем позицию головы
            const headSegment = this.segments[0];
            headSegment.position.add(this.direction);
            
            // Обновляем позиции тела
            for (let i = 1; i < this.segments.length; i++) {
                this.segments[i].position.copy(prevPositions[i - 1]);
            }
        }
        
        // Плавное обновление позиций мешей
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (i === 0) {
                // Для головы - плавное движение к следующей позиции
                const targetPosition = segment.position.clone().add(this.direction.clone().multiplyScalar(this.movementProgress));
                segment.mesh.position.copy(targetPosition);
            } else {
                // Для остальных сегментов - плавное следование за предыдущим сегментом
                const prevSegment = this.segments[i - 1];
                const direction = prevSegment.position.clone().sub(segment.position);
                const targetPosition = segment.position.clone().add(direction.multiplyScalar(this.movementProgress));
                segment.mesh.position.copy(targetPosition);
            }
        }
    }
    
    // Увеличение змейки (добавление нового сегмента)
    grow() {
        const lastSegment = this.segments[this.segments.length - 1];
        const newSegment = {
            mesh: new THREE.Mesh(this.geometry, this.material),
            position: lastSegment.position.clone()
        };
        
        // Добавляем сегмент в конец
        newSegment.mesh.position.copy(newSegment.position);
        this.segments.push(newSegment);
        this.scene.add(newSegment.mesh);
    }
    
    // Проверка столкновения с едой
    checkFoodCollision(food) {
        const head = this.segments[0].position;
        return head.distanceTo(food.mesh.position) < this.size;
    }
    
    // Проверка столкновения со стенами
    checkWallCollision(playField) {
        const head = this.segments[0].position;
        const halfSize = playField.geometry.parameters.width / 2;
        
        return (
            Math.abs(head.x) > halfSize - this.size / 2 ||
            Math.abs(head.y) > halfSize - this.size / 2 ||
            Math.abs(head.z) > halfSize - this.size / 2
        );
    }
    
    // Проверка столкновения с собой
    checkSelfCollision() {
        const head = this.segments[0].position;
        
        // Проверяем столкновение головы с каждым сегментом тела
        for (let i = 4; i < this.segments.length; i++) {
            const distance = head.distanceTo(this.segments[i].position);
            if (distance < this.size * 0.9) return true;
        }
        
        return false;
    }
    
    // Удаление змейки из сцены
    removeFromScene(scene) {
        this.segments.forEach(segment => {
            scene.remove(segment.mesh);
        });
        this.segments = [];
    }
}