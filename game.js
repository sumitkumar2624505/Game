const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

let level = 1;
let player, platforms, spikes, boss;
let keys = {};
let reverse = false;
let shake = 0;

const jumpSound = document.getElementById("jumpSound");
const dieSound = document.getElementById("dieSound");
const bossSound = document.getElementById("bossSound");

// Controls
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Mobile controls
let mobile = { left:false, right:false, jump:false };

document.getElementById("left").ontouchstart = () => mobile.left = true;
document.getElementById("left").ontouchend = () => mobile.left = false;

document.getElementById("right").ontouchstart = () => mobile.right = true;
document.getElementById("right").ontouchend = () => mobile.right = false;

document.getElementById("jump").ontouchstart = () => mobile.jump = true;
document.getElementById("jump").ontouchend = () => mobile.jump = false;

// INIT LEVEL
function initLevel() {
  player = {
    x: 50,
    y: 300,
    w: 30,
    h: 30,
    dx: 0,
    dy: 0,
    speed: 4,
    jump: -12,
    gravity: 0.6,
    grounded: false
  };

  platforms = [{x: 0, y: 350, w: 800, h: 50}];
  spikes = [];
  boss = null;

  for (let i = 0; i < 5 + level; i++) {
    let x = Math.random() * 700;
    let y = Math.random() * 250;

    platforms.push({
      x,
      y,
      w: 80,
      h: 10,
      fake: Math.random() < 0.3
    });

    if (Math.random() < 0.4) {
      spikes.push({
        x: x + 20,
        y: y - 20,
        w: 20,
        h: 20
      });
    }
  }

  if (level % 10 === 0) {
    boss = {
      x: 600,
      y: 300,
      w: 50,
      h: 50,
      hp: 3 + level / 5
    };
    bossSound.play();
  }

  reverse = false;
}

initLevel();

// Screen shake
function screenShake(power = 10) {
  shake = power;
}

// UPDATE
function update() {
  if (!reverse) {
    if (keys["ArrowRight"] || mobile.right) player.dx = player.speed;
    else if (keys["ArrowLeft"] || mobile.left) player.dx = -player.speed;
    else player.dx = 0;
  } else {
    if (keys["ArrowRight"] || mobile.right) player.dx = -player.speed;
    else if (keys["ArrowLeft"] || mobile.left) player.dx = player.speed;
    else player.dx = 0;
  }

  if ((keys[" "] || mobile.jump) && player.grounded) {
    player.dy = player.jump;
    player.grounded = false;
    jumpSound.play();
  }

  player.dy += player.gravity;
  player.x += player.dx;
  player.y += player.dy;

  player.grounded = false;

  platforms.forEach(p => {
    if (player.x < p.x + p.w &&
        player.x + player.w > p.x &&
        player.y < p.y + p.h &&
        player.y + player.h > p.y) {

      player.y = p.y - player.h;
      player.dy = 0;
      player.grounded = true;

      if (p.fake) {
        setTimeout(() => {
          platforms = platforms.filter(pl => pl !== p);
        }, 200);
      }
    }
  });

  spikes.forEach(s => {
    if (player.x < s.x + s.w &&
        player.x + player.w > s.x &&
        player.y < s.y + s.h &&
        player.y + player.h > s.y) {
      die();
    }
  });

  if (Math.random() < 0.002) reverse = !reverse;

  if (boss) {
    boss.x += Math.sin(Date.now() / 500) * 2;

    if (player.x < boss.x + boss.w &&
        player.x + player.w > boss.x &&
        player.y < boss.y + boss.h &&
        player.y + player.h > boss.y) {
      die();
    }

    if (player.y + player.h < boss.y + 10) {
      boss.hp--;
      player.dy = -10;

      if (boss.hp <= 0) nextLevel();
    }
  }

  if (player.x > 750) nextLevel();
  if (player.y > canvas.height) die();
}

// DRAW
function draw() {
  ctx.save();

  if (shake > 0) {
    ctx.translate(Math.random()*shake - shake/2, Math.random()*shake - shake/2);
    shake *= 0.9;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "green";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  ctx.fillStyle = "red";
  spikes.forEach(s => ctx.fillRect(s.x, s.y, s.w, s.h));

  if (boss) {
    ctx.fillStyle = "purple";
    ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
    ctx.fillStyle = "white";
    ctx.fillText("Boss HP: " + boss.hp, boss.x, boss.y - 10);
  }

  ctx.fillStyle = "yellow";
  ctx.fillText("Level: " + level, 10, 20);

  ctx.restore();
}

// NEXT LEVEL
function nextLevel() {
  level++;
  alert("😈 Level " + level);
  initLevel();
}

// DIE
function die() {
  dieSound.play();
  screenShake(20);
  alert("😂 You Died at Level " + level);
  level = 1;
  initLevel();
}

// LOOP
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
