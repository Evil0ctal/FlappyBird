async function loadLeaderboard() {
    try {
        const response = await fetch('http://localhost:8000/api/leaderboard');
        if (response.ok) {
            const scores = await response.json();
            displayLeaderboard(scores);
        }
    } catch (error) {
        console.error('加载排行榜失败:', error);
    }
}

function displayLeaderboard(scores) {
    const leaderboardList = document.getElementById('leaderboardList');
    leaderboardList.innerHTML = '';
    
    scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${score.name} - ${score.score}分`;
        if (index < 3) {
            li.classList.add(`rank-${index + 1}`);
        }
        leaderboardList.appendChild(li);
    });
}

loadLeaderboard();
setInterval(loadLeaderboard, 30000);