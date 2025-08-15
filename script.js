// Lógica del juego Invasión Espacial

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverDiv = document.getElementById('gameOver');
const finalScoreSpan = document.getElementById('finalScore');
const scoreDiv = document.getElementById('score');

let player;
let bullets;
let enemies;
let score;
let keys = {};
let gameRunning = false;
let lastEnemySpawn = 0;
let lastBulletTime = 0;

const ENEMY_SPAWN_INTERVAL = 1000; // milisegundos entre apariciones de enemigos
const BULLET_COOLDOWN = 300; // tiempo mínimo entre disparos

// Definir jugador
function createPlayer() {
  return {
    x: canvas.width / 2 - 20,
    y: canvas.height - 40,
    width: 40,
    height: 20,
    speed: 5,
  };
}

// Crear un nuevo enemigo en una posición horizontal aleatoria
function spawnEnemy() {
  const width = 40;
  const height = 20;
  const x = Math.random() * (canvas.width - width);
  const speedY = 2 + Math.random() * 2; // velocidad vertical aleatoria entre 2 y 4
  const speedX = (Math.random() - 0.5) * 1; // leve movimiento horizontal
  enemies.push({ x, y: -height, width, height, speedX, speedY });
}

// Iniciar el juego o reiniciar
function startGame() {
  // Inicializar variables de juego
  player = createPlayer();
  bullets = [];
  enemies = [];
  score = 0;
  keys = {};
  gameRunning = true;
  lastEnemySpawn = 0;
  lastBulletTime = 0;
  scoreDiv.textContent = `Puntaje: ${score}`;
  gameOverDiv.classList.add('hidden');
  startBtn.classList.add('hidden');

  // Iniciar el bucle de juego
  requestAnimationFrame(update);
}

// Dibujar jugador, enemigos y balas
function drawPlayer() {
  ctx.fillStyle = '#0f0';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
  ctx.fillStyle = '#ff0';
  bullets.forEach((b) => {
    // Dibujar la bala como un rectángulo delgado
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });
}

function drawEnemies() {
  ctx.fillStyle = '#f00';
  enemies.forEach((e) => {
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });
}

// Manejo de teclas
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Función principal de actualización
function update(timestamp) {
  if (!gameRunning) return;

  // Limpiar el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Manejar movimiento del jugador
  if (keys['ArrowLeft']) {
    player.x -= player.speed;
    if (player.x < 0) player.x = 0;
  }
  if (keys['ArrowRight']) {
    player.x += player.speed;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  }

  // Disparo de balas
  if (keys['Space'] || keys['Spacebar']) {
    if (timestamp - lastBulletTime > BULLET_COOLDOWN) {
      // La bala se crea en la mitad del jugador pero con coordenada x como extremo izquierdo
      const bulletWidth = 4;
      const bulletHeight = 10;
      const bulletX = player.x + player.width / 2 - bulletWidth / 2;
      const bulletY = player.y - bulletHeight;
      bullets.push({ x: bulletX, y: bulletY, width: bulletWidth, height: bulletHeight, speed: 6 });
      lastBulletTime = timestamp;
    }
  }

  // Actualizar balas
  bullets.forEach((b) => {
    b.y -= b.speed;
  });
  // Eliminar balas fuera de pantalla
  bullets = bullets.filter((b) => b.y + b.height > 0);

  // Generar enemigos según el intervalo
  if (timestamp - lastEnemySpawn > ENEMY_SPAWN_INTERVAL) {
    spawnEnemy();
    lastEnemySpawn = timestamp;
  }
  // Actualizar enemigos
  enemies.forEach((e) => {
    e.y += e.speedY;
    e.x += e.speedX;
    // Rebotar en los bordes
    if (e.x < 0 || e.x + e.width > canvas.width) {
      e.speedX *= -1;
    }
  });

  // Colisiones bala-enemigo
  // Utilizamos listas temporales para evitar modificar los arreglos mientras iteramos
  const bulletsToRemove = new Set();
  const enemiesToRemove = new Set();

  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      const collide =
        b.x < e.x + e.width &&
        b.x + b.width > e.x &&
        b.y < e.y + e.height &&
        b.y + b.height > e.y;
      if (collide) {
        bulletsToRemove.add(bi);
        enemiesToRemove.add(ei);
        score += 1;
      }
    });
  });
  // Actualizar puntaje si hubo colisiones
  if (bulletsToRemove.size > 0) {
    scoreDiv.textContent = `Puntaje: ${score}`;
  }
  // Filtrar balas y enemigos
  bullets = bullets.filter((_, idx) => !bulletsToRemove.has(idx));
  enemies = enemies.filter((_, idx) => !enemiesToRemove.has(idx));

  // Colisiones enemigo-jugador o enemigos que llegan al fondo
  enemies.forEach((e) => {
    // Colisión con jugador
    if (
      e.x < player.x + player.width &&
      e.x + e.width > player.x &&
      e.y < player.y + player.height &&
      e.y + e.height > player.y
    ) {
      endGame();
    }
    // Llegó al fondo
    if (e.y + e.height >= canvas.height) {
      endGame();
    }
  });

  // Dibujar todos los elementos
  drawPlayer();
  drawBullets();
  drawEnemies();

  // Continuar el ciclo de actualización
  requestAnimationFrame(update);
}

// Fin del juego
function endGame() {
  gameRunning = false;
  // Mostrar contenedor de fin de juego
  finalScoreSpan.textContent = `Tu puntaje: ${score}`;
  gameOverDiv.classList.remove('hidden');
  restartBtn.classList.remove('hidden');
}

// Escuchar clic en botón de inicio
startBtn.addEventListener('click', () => {
  startGame();
});

// Escuchar clic en botón de reinicio
restartBtn.addEventListener('click', () => {
  startGame();
});