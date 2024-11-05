// Сцена
const scene = new THREE.Scene();

// Ортографическая камера
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(-10 * aspect, 10 * aspect, 10, -10, 0.1, 1000);
camera.position.set(0, 5, 5); // Камера находится за объектом и смотрит на него
camera.lookAt(0, 0, 0); // Камера смотрит на центр координат (0,0,0)

// Рендерер
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Матрица для кабинетной проекции
function cabinetProjectionMatrix() {
    const angle = Math.PI / 4;  // Угол 45 градусов
    const factor = 0.5;         // Масштабирование вдоль оси Z для кабинетной проекции

    return [
        [1, 0, -factor * Math.cos(angle), 0],
        [0, 1, -factor * Math.sin(angle), 0],
        [0, 0, 0, 0],
        [0, 0, 0, 1]
    ];
}

// Применение кабинетной проекции к вектору
function applyCabinetProjection(point) {
    const matrix = cabinetProjectionMatrix();
    return multiplyMatrixAndPoint(matrix, point);
}

// Оси координат
const axesPoints = [
    new THREE.Vector3(0, 0, 0),  // Начальная точка (центр)
    new THREE.Vector3(10, 0, 0),  // X ось
    new THREE.Vector3(0, 10, 0),  // Y ось
    new THREE.Vector3(0, 0, 10)   // Z ось
];

// Преобразуем точки для осей через кабинетную проекцию
const axesProjected = axesPoints.map(point => applyCabinetProjection(point));

// Создание осей через проецированные точки
const axesEdges = [
    [0, 1], // X ось
    [0, 2], // Y ось
    [0, 3]  // Z ось
];

// Создание и добавление осей в сцену
axesEdges.forEach(edge => {
    const geometry = new THREE.BufferGeometry().setFromPoints([axesProjected[edge[0]], axesProjected[edge[1]]]);
    const materialX = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Красный для оси X
    const materialY = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // Зеленый для оси Y
    const materialZ = new THREE.LineBasicMaterial({ color: 0x0000ff }); // Синий для оси Z
    

    let material;
    if (edge[1] === 1) material = materialX;
    else if (edge[1] === 2) material = materialY;
    else material = materialZ;

    const line = new THREE.Line(geometry, material);
    scene.add(line);
});

// Вершины для объёмной буквы "Г" (в 3D)
let points = [
    // Передняя часть (толщина вдоль оси Z = 1)
    new THREE.Vector3(0, 0, 0),  // A передний низ
    new THREE.Vector3(0, 5, 0),  // B передний верх
    new THREE.Vector3(3, 5, 0),  // C передний верхний правый угол
    new THREE.Vector3(3, 4, 0),  // D передний средний правый угол
    new THREE.Vector3(1, 4, 0),  // E передний средний левый угол
    new THREE.Vector3(1, 0, 0),  // F передний нижний левый угол

    // Задняя часть (толщина вдоль оси Z = 1)
    new THREE.Vector3(0, 0, 1),  // G задний низ
    new THREE.Vector3(0, 5, 1),  // H задний верх
    new THREE.Vector3(3, 5, 1),  // I задний верхний правый угол
    new THREE.Vector3(3, 4, 1),  // J задний средний правый угол
    new THREE.Vector3(1, 4, 1),  // K задний средний левый угол
    new THREE.Vector3(1, 0, 1)   // L задний нижний левый угол
];

// Преобразуем точки для кабинетной проекции
let pointsProjected = points.map(point => applyCabinetProjection(point));

// Соединяем рёбра для создания объёмной формы
const edges = [
    // Передние рёбра
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    // Задние рёбра
    [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 6],
    // Соединяем переднюю и заднюю часть
    [0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]
];

// Создание и добавление линий в сцену с использованием проецированных точек
edges.forEach(edge => {
    const geometry = new THREE.BufferGeometry().setFromPoints([pointsProjected[edge[0]], pointsProjected[edge[1]]]);
    const material = new THREE.LineBasicMaterial({ color: 0xff00ff });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
});

// Функция для умножения матрицы на вектор
function multiplyMatrixAndPoint(matrix, point) {
    const x = point.x, y = point.y, z = point.z;
    const result = new THREE.Vector3(
        matrix[0][0] * x + matrix[0][1] * y + matrix[0][2] * z + matrix[0][3],
        matrix[1][0] * x + matrix[1][1] * y + matrix[1][2] * z + matrix[1][3],
        matrix[2][0] * x + matrix[2][1] * y + matrix[2][2] * z + matrix[2][3]
    );
    return result;
}

// Матрица трансляции
function translationMatrix(tx, ty, tz) {
    return [
        [1, 0, 0, tx],
        [0, 1, 0, ty],
        [0, 0, 1, tz],
        [0, 0, 0, 1]
    ];
}

// Матрица вращения вокруг оси X
function rotationMatrixX(angle) {
    return [
        [1, 0, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle), 0],
        [0, Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 0, 1]
    ];
}

// Матрица вращения вокруг оси Y
function rotationMatrixY(angle) {
    return [
        [Math.cos(angle), 0, Math.sin(angle), 0],
        [0, 1, 0, 0],
        [-Math.sin(angle), 0, Math.cos(angle), 0],
        [0, 0, 0, 1]
    ];
}

// Матрица вращения вокруг оси Z
function rotationMatrixZ(angle) {
    return [
        [Math.cos(angle), -Math.sin(angle), 0, 0],
        [Math.sin(angle), Math.cos(angle), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

// Матрица масштабирования
function scalingMatrix(sx, sy, sz) {
    return [
        [sx, 0, 0, 0],
        [0, sy, 0, 0],
        [0, 0, sz, 0],
        [0, 0, 0, 1]
    ];
}

// Применение трансляции к букве "Г"
function moveLetterG(tx, ty, tz) {
    const matrix = translationMatrix(tx, ty, tz);
    points = points.map(point => multiplyMatrixAndPoint(matrix, point));
    updateGeometry();
}

// Применение вращения к букве "Г"
function rotateLetterG(axis, angle) {
    let matrix;
    if (axis === 'x') matrix = rotationMatrixX(angle);
    else if (axis === 'y') matrix = rotationMatrixY(angle);
    else if (axis === 'z') matrix = rotationMatrixZ(angle);

    points = points.map(point => multiplyMatrixAndPoint(matrix, point));
    updateGeometry();
}

// Применение масштабирования к букве "Г"
function scaleLetterG(sx, sy, sz) {
    const matrix = scalingMatrix(sx, sy, sz);
    points = points.map(point => multiplyMatrixAndPoint(matrix, point));
    updateGeometry();
}

// Обновление геометрии для отрисовки
function updateGeometry() {
    pointsProjected = points.map(point => applyCabinetProjection(point));
    edges.forEach((edge, index) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([pointsProjected[edge[0]], pointsProjected[edge[1]]]);
        scene.children[index + axesEdges.length].geometry = geometry;
    });

    if (symmetryVisible) updateReflectedObject();
}

// Матрица отражения относительно плоскости X=0
function reflectionMatrixX() {
    return [
        [-1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

// Матрица отражения относительно плоскости Y=0
function reflectionMatrixY() {
    return [
        [1, 0, 0, 0],
        [0, -1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

// Матрица отражения относительно плоскости Z=0
function reflectionMatrixZ() {
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, -1, 0],
        [0, 0, 0, 1]
    ];
}

// Применение матрицы отражения
function reflectPoints(points, axis) {
    let matrix;
    if (axis === 'x') matrix = reflectionMatrixX();
    else if (axis === 'y') matrix = reflectionMatrixY();
    else if (axis === 'z') matrix = reflectionMatrixZ();

    return points.map(point => multiplyMatrixAndPoint(matrix, point));
}

// Создание симметричного объекта
function createReflectedObject() {
    reflectedPoints = reflectPoints(points, currentAxis);
    reflectedProjected = reflectedPoints.map(point => applyCabinetProjection(point));

    reflectedLines = edges.map(edge => {
        const geometry = new THREE.BufferGeometry().setFromPoints([reflectedProjected[edge[0]], reflectedProjected[edge[1]]]);
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        return line;
    });
}

// Обновление симметричного объекта при трансформациях
function updateReflectedObject() {
    reflectedPoints = reflectPoints(points, currentAxis);
    reflectedProjected = reflectedPoints.map(point => applyCabinetProjection(point));

    reflectedLines.forEach((line, index) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([reflectedProjected[edges[index][0]], reflectedProjected[edges[index][1]]]);
        line.geometry = geometry;
    });
}

// Тоггл симметрии
let currentAxis = 'x';
let symmetryVisible = false;
let reflectedPoints = [];
let reflectedProjected = [];
let reflectedLines = [];

function toggleSymmetry(axis) {
    currentAxis = axis;
    if (!symmetryVisible) {
        createReflectedObject();
        symmetryVisible = true;
    } else {
        updateReflectedObject();
    }
}

// Добавляем орбитальные контроллеры
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Функция анимации
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Обработчики для кнопок
document.getElementById('moveXPlus').addEventListener('click', () => moveLetterG(1, 0, 0));
document.getElementById('moveXMinus').addEventListener('click', () => moveLetterG(-1, 0, 0));
document.getElementById('moveYPlus').addEventListener('click', () => moveLetterG(0, 1, 0));
document.getElementById('moveYMinus').addEventListener('click', () => moveLetterG(0, -1, 0));
document.getElementById('moveZPlus').addEventListener('click', () => moveLetterG(0, 0, 1));
document.getElementById('moveZMinus').addEventListener('click', () => moveLetterG(0, 0, -1));

document.getElementById('rotateXPlus').addEventListener('click', () => rotateLetterG('x', Math.PI / 18));
document.getElementById('rotateXMinus').addEventListener('click', () => rotateLetterG('x', -Math.PI / 18));
document.getElementById('rotateYPlus').addEventListener('click', () => rotateLetterG('y', Math.PI / 18));
document.getElementById('rotateYMinus').addEventListener('click', () => rotateLetterG('y', -Math.PI / 18));
document.getElementById('rotateZPlus').addEventListener('click', () => rotateLetterG('z', Math.PI / 18));
document.getElementById('rotateZMinus').addEventListener('click', () => rotateLetterG('z', -Math.PI / 18));

document.getElementById('scaleUp').addEventListener('click', () => scaleLetterG(1.1, 1.1, 1.1));
document.getElementById('scaleDown').addEventListener('click', () => scaleLetterG(0.9, 0.9, 0.9));

document.getElementById('axisX').addEventListener('click', () => toggleSymmetry('x'));
document.getElementById('axisY').addEventListener('click', () => toggleSymmetry('y'));
document.getElementById('axisZ').addEventListener('click', () => toggleSymmetry('z'));
