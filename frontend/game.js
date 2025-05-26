const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('score');
const finalScoreDisplay = document.getElementById('finalScore');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const playerNameInput = document.getElementById('playerNameInput');

// 音效管理
const sounds = {
    jump: null,
    score: null,
    hit: null,
    swoosh: null
};

// 初始化音效
function initSounds() {
    // 创建音效函数（使用Web Audio API生成音效）
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 跳跃音效
    sounds.jump = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };
    
    // 得分音效
    sounds.score = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    };
    
    // 碰撞音效
    sounds.hit = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    };
    
    // 切换音效
    sounds.swoosh = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };
}

// 播放音效
function playSound(soundName) {
    if (sounds[soundName]) {
        try {
            sounds[soundName]();
        } catch (e) {
            console.error('音效播放失败:', e);
        }
    }
}

// 游戏配置
const difficulties = {
    easy: {
        gravity: 0.15,      
        jump: -4.5,         
        pipeSpeed: 1.2,     
        pipeGap: 180,       // 垂直间隙
        pipeFrequency: 180, // 管道出现间隔（帧数）
        minPipeDistance: 350 // 最小横向间距
    },
    normal: {
        gravity: 0.18,      
        jump: -5,           
        pipeSpeed: 1.8,     
        pipeGap: 150,       
        pipeFrequency: 140,  
        minPipeDistance: 300 // 中等横向间距
    },
    hard: {
        gravity: 0.22,      
        jump: -5.5,         
        pipeSpeed: 2.5,     
        pipeGap: 130,       
        pipeFrequency: 100,   
        minPipeDistance: 250 // 较小横向间距
    }
};

let currentDifficulty = 'normal';
let playerName = '';

const bird = {
    x: 50,
    y: 200,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: difficulties[currentDifficulty].gravity,
    jump: difficulties[currentDifficulty].jump
};

const pipes = [];
const pipeWidth = 50;
let pipeGap = difficulties[currentDifficulty].pipeGap;
let pipeSpeed = difficulties[currentDifficulty].pipeSpeed;
let pipeFrequency = difficulties[currentDifficulty].pipeFrequency;

let score = 0;
let gameState = 'start';
let frame = 0;
let animationId = null;
let countdown = 0;
let countdownInterval = null;
// 背景元素
let clouds = [];
let mountains = [];
let groundTiles = [];
let bushes = [];
let flowers = [];

// 设置响应式画布尺寸
function resizeCanvas() {
    const gameArea = document.querySelector('.game-area');
    const maxWidth = Math.min(gameArea.offsetWidth - 40, 900);  // 增大最大宽度到900
    const maxHeight = Math.min(window.innerHeight - 80, 700);   // 增大最大高度到700
    
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    
    // 调整鸟的初始位置
    bird.x = canvas.width * 0.15;
    
    // 初始化背景元素
    initBackground();
}

// 初始化背景元素
function initBackground() {
    // 生成云朵
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height * 0.4),
            width: 60 + Math.random() * 40,
            speed: 0.3 + Math.random() * 0.3
        });
    }
    
    // 生成山脉
    mountains = [];
    for (let i = 0; i < 3; i++) {
        mountains.push({
            x: i * (canvas.width / 2),
            height: 100 + Math.random() * 50,
            speed: 0.5
        });
    }
    
    // 初始化地面瓦片
    groundTiles = [];
    const tileSize = 40;
    for (let x = -tileSize; x < canvas.width * 2; x += tileSize) {
        groundTiles.push({
            x: x,
            type: Math.random() > 0.7 ? 'pattern' : 'plain'
        });
    }
    
    // 初始化灌木丛
    bushes = [];
    for (let i = 0; i < 8; i++) {
        bushes.push({
            x: Math.random() * canvas.width * 2,
            width: 60 + Math.random() * 40,
            height: 30 + Math.random() * 20
        });
    }
    
    // 初始化花朵
    flowers = [];
    for (let i = 0; i < 12; i++) {
        flowers.push({
            x: Math.random() * canvas.width * 2,
            type: Math.floor(Math.random() * 3),
            size: 8 + Math.random() * 4
        });
    }
}

// 绘制背景
function drawBackground() {
    // 天空渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#B0E0E6');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制云朵
    drawClouds();
    
    // 绘制远山
    drawMountains();
    
    // 绘制草地
    drawGrass();
}

// 绘制云朵
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    clouds.forEach(cloud => {
        // 简单的云朵形状
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width * 0.5, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 0.3, cloud.y, cloud.width * 0.4, 0, Math.PI * 2);
        ctx.arc(cloud.x - cloud.width * 0.3, cloud.y, cloud.width * 0.4, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 绘制山脉
function drawMountains() {
    mountains.forEach((mountain, index) => {
        const alpha = 0.3 + index * 0.1;
        ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
        
        ctx.beginPath();
        ctx.moveTo(mountain.x - 150, canvas.height - 60);
        ctx.lineTo(mountain.x, canvas.height - 60 - mountain.height);
        ctx.lineTo(mountain.x + 150, canvas.height - 60);
        ctx.closePath();
        ctx.fill();
    });
}

// 绘制草地（超级马里奥风格）
function drawGrass() {
    const groundHeight = 60;
    const grassTop = canvas.height - groundHeight;
    
    // 绘制地面瓦片
    const tileSize = 40;
    groundTiles.forEach(tile => {
        // 主地面颜色
        const gradient = ctx.createLinearGradient(0, grassTop, 0, canvas.height);
        gradient.addColorStop(0, '#8FBC8F');
        gradient.addColorStop(0.5, '#3CB371');
        gradient.addColorStop(1, '#2E7D32');
        ctx.fillStyle = gradient;
        ctx.fillRect(tile.x, grassTop, tileSize, groundHeight);
        
        // 瓦片边缘
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 1;
        ctx.strokeRect(tile.x, grassTop, tileSize, groundHeight);
        
        // 瓦片图案
        if (tile.type === 'pattern') {
            ctx.fillStyle = '#90EE90';
            ctx.beginPath();
            ctx.arc(tile.x + tileSize/2, grassTop + 10, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // 绘制灌木丛（在地面上）
    bushes.forEach(bush => {
        const bushGradient = ctx.createRadialGradient(
            bush.x + bush.width/2, grassTop - bush.height/2, 10,
            bush.x + bush.width/2, grassTop - bush.height/2, bush.width/2
        );
        bushGradient.addColorStop(0, '#32CD32');
        bushGradient.addColorStop(1, '#228B22');
        
        ctx.fillStyle = bushGradient;
        ctx.beginPath();
        // 绘制三个圆形组成灌木
        ctx.arc(bush.x + bush.width * 0.3, grassTop - bush.height * 0.5, bush.width * 0.3, 0, Math.PI * 2);
        ctx.arc(bush.x + bush.width * 0.7, grassTop - bush.height * 0.5, bush.width * 0.3, 0, Math.PI * 2);
        ctx.arc(bush.x + bush.width * 0.5, grassTop - bush.height * 0.8, bush.width * 0.35, 0, Math.PI * 2);
        ctx.fill();
        
        // 灌木阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(bush.x + bush.width/2, grassTop, bush.width/2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 绘制花朵
    flowers.forEach(flower => {
        const colors = ['#FFD700', '#FF69B4', '#87CEEB'];
        ctx.fillStyle = colors[flower.type];
        
        // 花茎
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(flower.x, grassTop);
        ctx.lineTo(flower.x, grassTop - 20);
        ctx.stroke();
        
        // 花瓣
        for (let i = 0; i < 5; i++) {
            const angle = (i * 72) * Math.PI / 180;
            ctx.beginPath();
            ctx.arc(
                flower.x + Math.cos(angle) * flower.size,
                grassTop - 20 + Math.sin(angle) * flower.size,
                flower.size * 0.6,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // 花心
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(flower.x, grassTop - 20, flower.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 更新背景元素
function updateBackground() {
    // 更新云朵位置
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width + cloud.width;
            cloud.y = Math.random() * (canvas.height * 0.4);
        }
    });
    
    // 更新山脉位置
    mountains.forEach(mountain => {
        mountain.x -= mountain.speed;
        if (mountain.x < -200) {
            mountain.x = canvas.width + 200;
            mountain.height = 100 + Math.random() * 50;
        }
    });
    
    // 更新地面元素位置（与管道同步）
    const currentSpeed = difficulties[currentDifficulty].pipeSpeed;
    
    // 更新地面瓦片
    groundTiles.forEach(tile => {
        tile.x -= currentSpeed;
        if (tile.x < -40) {
            tile.x = canvas.width + 40;
            tile.type = Math.random() > 0.7 ? 'pattern' : 'plain';
        }
    });
    
    // 更新灌木丛
    bushes.forEach(bush => {
        bush.x -= currentSpeed;
        if (bush.x + bush.width < 0) {
            bush.x = canvas.width + Math.random() * 200;
            bush.width = 60 + Math.random() * 40;
            bush.height = 30 + Math.random() * 20;
        }
    });
    
    // 更新花朵
    flowers.forEach(flower => {
        flower.x -= currentSpeed;
        if (flower.x < -20) {
            flower.x = canvas.width + Math.random() * 200;
            flower.type = Math.floor(Math.random() * 3);
            flower.size = 8 + Math.random() * 4;
        }
    });
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    
    // 根据速度旋转鸟
    const rotation = Math.min(Math.max(bird.velocity * 3, -45), 45) * Math.PI / 180;
    ctx.rotate(rotation);
    
    // 鸟身体
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
    
    // 鸟嘴
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(-bird.width / 2 + 5, -bird.height / 2 + 5, 10, 5);
    
    // 眼睛
    ctx.fillStyle = '#000';
    ctx.fillRect(bird.width / 2 - 10, -bird.height / 2 + 8, 5, 5);
    
    ctx.restore();
}

function drawPipes() {
    pipes.forEach(pipe => {
        // 管道渐变
        const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        pipeGradient.addColorStop(0, '#228B22');
        pipeGradient.addColorStop(0.5, '#32CD32');
        pipeGradient.addColorStop(1, '#228B22');
        
        ctx.fillStyle = pipeGradient;
        
        // 上管道
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillStyle = '#1F5F1F';
        ctx.fillRect(pipe.x - 5, pipe.top - 30, pipeWidth + 10, 30);
        
        // 下管道
        ctx.fillStyle = pipeGradient;
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom - 60);
        ctx.fillStyle = '#1F5F1F';
        ctx.fillRect(pipe.x - 5, pipe.bottom, pipeWidth + 10, 30);
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height - 60 || bird.y < 0) {
        gameOver();
    }
}

function updatePipes() {
    if (frame % pipeFrequency === 0) {
        const minTop = 50;
        const maxTop = canvas.height - pipeGap - 110;  // 调整为新地面高度
        const pipeTop = Math.random() * (maxTop - minTop) + minTop;
        pipes.push({
            x: canvas.width,
            top: pipeTop,
            bottom: pipeTop + pipeGap,
            passed: false
        });
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;

        if (pipe.x + pipeWidth < -50) {
            pipes.splice(index, 1);
        }

        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            scoreDisplay.textContent = score;
            playSound('score');
        }

        if (checkCollision(pipe)) {
            gameOver();
        }
    });
}

function checkCollision(pipe) {
    return bird.x < pipe.x + pipeWidth &&
           bird.x + bird.width > pipe.x &&
           (bird.y < pipe.top || bird.y + bird.height > pipe.bottom);
}

function drawCountdown() {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);
    
    ctx.font = '24px Arial';
    ctx.fillText('准备开始！', canvas.width / 2, canvas.height / 2 + 80);
    ctx.restore();
}

function gameLoop() {
    if (gameState === 'countdown') {
        drawBackground();
        updateBackground();  // 倒计时期间也更新背景
        drawBird();
        drawPipes();
        drawCountdown();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (gameState !== 'playing') return;

    drawBackground();
    updateBackground();  // 更新背景动画
    updateBird();
    updatePipes();
    drawBird();
    drawPipes();

    frame++;
    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (!playerName) {
        alert('请先输入玩家昵称！');
        return;
    }
    
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    frame = 0;
    scoreDisplay.textContent = score;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    // 开始倒计时
    countdown = 3;
    gameState = 'countdown';
    
    gameLoop();
    
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            gameState = 'playing';
        }
    }, 1000);
}

function gameOver() {
    gameState = 'gameover';
    playSound('hit');
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    finalScoreDisplay.textContent = score;
    currentPlayerDisplay.textContent = playerName;
    gameOverScreen.style.display = 'flex';
}


function jump() {
    if (gameState === 'playing') {
        bird.velocity = bird.jump;
        playSound('jump');
    }
}

// 难度选择
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // 移除所有活动状态
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        // 添加活动状态
        e.target.classList.add('active');
        
        currentDifficulty = e.target.dataset.difficulty;
        const config = difficulties[currentDifficulty];
        
        // 更新游戏参数
        bird.gravity = config.gravity;
        bird.jump = config.jump;
        pipeSpeed = config.pipeSpeed;
        pipeGap = config.pipeGap;
        pipeFrequency = config.pipeFrequency;
        
        // 验证玩家名称并开始游戏
        playerName = playerNameInput.value.trim();
        if (playerName) {
            startGame();
        }
    });
});


// 游戏控制
canvas.addEventListener('click', jump);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') {
            jump();
        }
    }
});

// 重新开始
document.getElementById('restartBtn').addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    gameState = 'start';
    startGame();
});

// 更换玩家
document.getElementById('changePlayer').addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
    gameState = 'start';
});

// 提交分数
document.getElementById('submitScore').addEventListener('click', async () => {
    if (score > 0) {
        const submitBtn = document.getElementById('submitScore');
        submitBtn.disabled = true;
        submitBtn.textContent = '提交中...';
        
        try {
            const response = await fetch('http://localhost:8000/api/submit_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: playerName,
                    score: score
                })
            });
            
            if (response.ok) {
                alert('分数提交成功！');
                await loadLeaderboard();
                submitBtn.textContent = '已提交';
            } else {
                throw new Error('提交失败');
            }
        } catch (error) {
            console.error('提交分数失败:', error);
            alert('提交失败，请重试');
            submitBtn.disabled = false;
            submitBtn.textContent = '提交分数';
        }
    }
});

// 窗口大小变化时调整画布
window.addEventListener('resize', () => {
    resizeCanvas();
});

// 初始化
resizeCanvas();
initSounds();
// 默认选中普通难度
document.querySelector('[data-difficulty="normal"]').classList.add('active');