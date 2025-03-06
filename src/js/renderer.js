import * as THREE from 'three';

// Настройка рендерера
export function setupRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Добавление рендерера на страницу
    document.getElementById('game-canvas').appendChild(renderer.domElement);
    
    return renderer;
}

// Создание освещения для сцены
export function createLights() {
    const lights = [];
    
    // Основной свет (направленный)
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    lights.push(mainLight);
    
    // Противоположный мягкий свет
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-10, 5, -10);
    lights.push(fillLight);
    
    // Общее освещение
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    lights.push(ambientLight);
    
    return lights;
}

// Создание игрового поля
export function createPlayField() {
    // Размер игрового поля
    const size = 10;
    
    // Прозрачная коробка для игрового поля
    const geometry = new THREE.BoxGeometry(size * 2, size * 2, size * 2);
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0xF44336, opacity: 0.5, transparent: true });
    
    // Создание сетки для визуализации игрового поля
    const grid = new THREE.LineSegments(edgesGeometry, material);
    
    // Создание сетки координат
    const gridHelper = new THREE.GridHelper(size * 2, size * 2, 0x888888, 0x444444);
    gridHelper.position.y = -size;
    
    // Прозрачные стены поля
    const walls = [];
    const wallMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xF44336, 
        opacity: 0.1, 
        transparent: true,
        side: THREE.DoubleSide
    });
    
    // Размеры стен
    const wallSize = size * 2;
    
    // Создание стен (6 граней куба)
    const wallGeometry = new THREE.PlaneGeometry(wallSize, wallSize);
    
    // Верхняя и нижняя стены
    const topWall = new THREE.Mesh(wallGeometry, wallMaterial);
    topWall.position.y = size;
    topWall.rotation.x = Math.PI / 2;
    walls.push(topWall);
    
    const bottomWall = new THREE.Mesh(wallGeometry, wallMaterial);
    bottomWall.position.y = -size;
    bottomWall.rotation.x = -Math.PI / 2;
    walls.push(bottomWall);
    
    // Левая и правая стены
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.x = -size;
    leftWall.rotation.y = Math.PI / 2;
    walls.push(leftWall);
    
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.x = size;
    rightWall.rotation.y = -Math.PI / 2;
    walls.push(rightWall);
    
    // Передняя и задняя стены
    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    frontWall.position.z = size;
    frontWall.rotation.y = Math.PI;
    walls.push(frontWall);
    
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.z = -size;
    walls.push(backWall);
    
    // Создаем группу для всех элементов игрового поля
    const playField = new THREE.Group();
    playField.add(grid);
    playField.add(gridHelper);
    walls.forEach(wall => playField.add(wall));
    
    // Добавляем свойство для доступа к размеру игрового поля
    playField.size = size;
    
    // Сохраняем геометрию для проверки столкновений
    playField.geometry = geometry;
    
    return playField;
} 