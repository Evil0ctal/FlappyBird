// Logo绘制
function drawLogo() {
    const logoCanvas = document.getElementById('logoCanvas');
    if (!logoCanvas) return;
    
    const ctx = logoCanvas.getContext('2d');
    const width = logoCanvas.width;
    const height = logoCanvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景渐变
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#87CEEB');
    bgGradient.addColorStop(1, '#B0E0E6');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 绘制小鸟
    const birdX = 40;
    const birdY = height / 2 - 15;
    
    // 鸟身体
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(birdX, birdY, 25, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 鸟翅膀
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(birdX - 5, birdY, 15, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 鸟眼睛外圈
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(birdX + 10, birdY - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 鸟眼睛
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(birdX + 12, birdY - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛高光
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(birdX + 13, birdY - 6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 鸟嘴
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(birdX + 20, birdY);
    ctx.lineTo(birdX + 35, birdY + 3);
    ctx.lineTo(birdX + 20, birdY + 6);
    ctx.closePath();
    ctx.fill();
    
    // 添加一些装饰云朵
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    // 小云朵1
    ctx.beginPath();
    ctx.arc(width - 40, 20, 8, 0, Math.PI * 2);
    ctx.arc(width - 30, 20, 10, 0, Math.PI * 2);
    ctx.arc(width - 20, 20, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 小云朵2
    ctx.beginPath();
    ctx.arc(width - 80, height - 20, 6, 0, Math.PI * 2);
    ctx.arc(width - 72, height - 20, 8, 0, Math.PI * 2);
    ctx.arc(width - 64, height - 20, 6, 0, Math.PI * 2);
    ctx.fill();
}

// 创建favicon
function createFavicon() {
    const faviconCanvas = document.createElement('canvas');
    faviconCanvas.width = 32;
    faviconCanvas.height = 32;
    const ctx = faviconCanvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, 32, 32);
    
    // 简化的鸟
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(16, 16, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(20, 14, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 嘴
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(24, 16);
    ctx.lineTo(28, 17);
    ctx.lineTo(24, 18);
    ctx.closePath();
    ctx.fill();
    
    // 设置favicon
    const link = document.getElementById('favicon');
    link.href = faviconCanvas.toDataURL('image/png');
}

// 页面加载完成后绘制
window.addEventListener('load', () => {
    drawLogo();
    createFavicon();
});