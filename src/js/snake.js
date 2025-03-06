import * as THREE from 'three';

// Класс змейки
export class Snake {
    constructor(scene) {
        // Настройки змейки
        this.size = 1; // Размер сегмента змейки
        this.initialSize = 3; // Начальная длина змейки
        this.speed = 5; // Скорость движения (сегментов в секунду)
        this.lastUpdateTime = 0; // Время последнего обновления
        
        // Направление движения (x, y, z)
        this.direction = new THREE.Vector3(1, 0, 0);
        this.nextDirection = new THREE.Vector3(1, 0, 0);
        
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
    
    // Обновление позиции змейки
    update() {
        const now = performance.now();
        const deltaTime = now - this.lastUpdateTime;
        
        // Обновляем с определенной частотой
        if (deltaTime > 1000 / this.speed) {
            this.lastUpdateTime = now;
            
            // Применяем следующее направление
            this.direction.copy(this.nextDirection);
            
            // Сохраняем предыдущие позиции
            const prevPositions = this.segments.map(segment => 
                segment.position.clone()
            );
            
            // Обновляем позицию головы
            const headSegment = this.segments[0];
            headSegment.position.add(this.direction);
            headSegment.mesh.position.copy(headSegment.position);
            
            // Обновляем позиции тела (каждый сегмент занимает позицию предыдущего)
            for (let i = 1; i < this.segments.length; i++) {
                this.segments[i].position.copy(prevPositions[i - 1]);
                this.segments[i].mesh.position.copy(this.segments[i].position);
            }
        }
    }
    
    // Установка нового направления
    setDirection(x, y, z) {
        // Проверяем, что новое направление не противоположно текущему
        const newDirection = new THREE.Vector3(x, y, z);
        if (this.direction.dot(newDirection) === -1) return;
        
        this.nextDirection.set(x, y, z);
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