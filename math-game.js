// Oyun değişkenleri
let currentLevel = 1;
let correctAnswers = 0;
let wrongAnswers = 0;
let currentQuestion = null;
let timer = null;
let timeLeft = 30;
let isPlaying = false;

// DOM elementleri
const levelEl = document.getElementById('level');
const correctEl = document.getElementById('correct');
const wrongEl = document.getElementById('wrong');
const timerEl = document.getElementById('timer');
const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answerInput');
const answerContainer = document.getElementById('answerContainer');
const submitBtn = document.getElementById('submitBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const feedbackEl = document.getElementById('feedback');
const progressBar = document.getElementById('progressBar');

// Matematik operatörleri
const operators = ['+', '-', '×', '÷'];

// Rastgele sayı üretme (seviyeye göre zorlaşır)
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Soru oluşturma (seviyeye göre zorlaşır)
function generateQuestion() {
    let num1, num2, operator, answer;
    
    // Seviyeye göre sayı aralığını belirle
    const maxNum = 10 + (currentLevel * 5); // Seviye arttıkça sayılar büyür
    const minNum = 1;
    
    operator = operators[Math.floor(Math.random() * operators.length)];
    
    // Bölme işlemi için özel kontrol
    if (operator === '÷') {
        num2 = randomNumber(2, Math.min(maxNum, 12)); // Bölen
        answer = randomNumber(1, Math.floor(maxNum / num2));
        num1 = num2 * answer; // Bölünen = Bölen * Bölüm
    } else if (operator === '-') {
        // Çıkarma işlemi için negatif sonuç olmaması için
        answer = randomNumber(1, maxNum - 1);
        num2 = randomNumber(1, answer);
        num1 = answer + num2;
    } else if (operator === '+') {
        num1 = randomNumber(minNum, maxNum);
        num2 = randomNumber(minNum, maxNum);
        answer = num1 + num2;
    } else if (operator === '×') {
        // Çarpma için seviyeye göre sınırla
        const maxMultiplier = Math.min(12, 2 + currentLevel);
        num1 = randomNumber(2, maxMultiplier);
        num2 = randomNumber(2, maxMultiplier);
        answer = num1 * num2;
    }
    
    return {
        num1: num1,
        num2: num2,
        operator: operator,
        answer: answer,
        question: `${num1} ${operator} ${num2} = ?`
    };
}

// Süre hesaplama (seviyeye göre değişir)
function getTimeForLevel() {
    // Seviye arttıkça süre azalır (minimum 15 saniye)
    return Math.max(15, 35 - currentLevel * 2);
}

// Soruyu göster
function showQuestion() {
    currentQuestion = generateQuestion();
    questionEl.textContent = currentQuestion.question;
    answerInput.value = '';
    answerInput.focus();
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback hidden';
    
    // Süreyi başlat
    timeLeft = getTimeForLevel();
    timerEl.textContent = timeLeft;
    timerEl.className = 'stat-value time';
    
    // İlerleme çubuğunu sıfırla
    progressBar.style.width = '100%';
    
    // Timer'ı başlat
    startTimer();
}

// Timer başlat
function startTimer() {
    if (timer) {
        clearInterval(timer);
    }
    
    const totalTime = timeLeft;
    const startTime = Date.now();
    
    timer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timeLeft = totalTime - elapsed;
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            timerEl.textContent = '0';
            timerEl.className = 'stat-value time warning';
            handleTimeout();
            clearInterval(timer);
        } else {
            timerEl.textContent = timeLeft;
            
            // 5 saniyenin altında uyarı
            if (timeLeft <= 5) {
                timerEl.className = 'stat-value time warning';
            }
            
            // İlerleme çubuğu
            const progress = (timeLeft / totalTime) * 100;
            progressBar.style.width = progress + '%';
        }
    }, 100);
}

// Süre dolduğunda
function handleTimeout() {
    wrongAnswers++;
    wrongEl.textContent = wrongAnswers;
    showFeedback('⏰ Süre doldu! Doğru cevap: ' + currentQuestion.answer, false);
    
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

// Cevabı kontrol et
function checkAnswer() {
    if (!currentQuestion || !isPlaying) return;
    
    const userAnswer = parseInt(answerInput.value);
    
    if (isNaN(userAnswer)) {
        feedbackEl.textContent = 'Lütfen bir sayı girin!';
        feedbackEl.className = 'feedback wrong';
        return;
    }
    
    if (timer) {
        clearInterval(timer);
    }
    
    if (userAnswer === currentQuestion.answer) {
        correctAnswers++;
        correctEl.textContent = correctAnswers;
        showFeedback('✅ Doğru! Harika!', true);
        currentLevel++;
        levelEl.textContent = currentLevel;
        
        // İlerleme çubuğunu yeşil yap
        progressBar.style.background = '#10b981';
    } else {
        wrongAnswers++;
        wrongEl.textContent = wrongAnswers;
        showFeedback(`❌ Yanlış! Doğru cevap: ${currentQuestion.answer}`, false);
        
        // İlerleme çubuğunu kırmızı yap
        progressBar.style.background = '#ef4444';
    }
    
    // Sonraki soruya geç
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

// Sonraki soru
function nextQuestion() {
    if (!isPlaying) return;
    
    // İlerleme çubuğunu sıfırla
    progressBar.style.background = 'linear-gradient(90deg, #10b981 0%, #667eea 100%)';
    showQuestion();
}

// Geri bildirim göster
function showFeedback(message, isCorrect) {
    feedbackEl.textContent = message;
    feedbackEl.className = isCorrect ? 'feedback correct' : 'feedback wrong';
}

// Oyunu başlat
function startGame() {
    isPlaying = true;
    currentLevel = 1;
    correctAnswers = 0;
    wrongAnswers = 0;
    
    levelEl.textContent = currentLevel;
    correctEl.textContent = correctAnswers;
    wrongEl.textContent = wrongAnswers;
    
    startBtn.style.display = 'none';
    resetBtn.style.display = 'none';
    answerContainer.style.display = 'flex';
    
    showQuestion();
}

// Oyunu sıfırla
function resetGame() {
    isPlaying = false;
    
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    currentLevel = 1;
    correctAnswers = 0;
    wrongAnswers = 0;
    timeLeft = 30;
    
    levelEl.textContent = currentLevel;
    correctEl.textContent = correctAnswers;
    wrongEl.textContent = wrongAnswers;
    timerEl.textContent = timeLeft;
    timerEl.className = 'stat-value time';
    
    questionEl.textContent = 'Hazır mısın? Başlamak için "Başla" butonuna tıkla!';
    answerInput.value = '';
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback hidden';
    progressBar.style.width = '100%';
    progressBar.style.background = 'linear-gradient(90deg, #10b981 0%, #667eea 100%)';
    
    startBtn.style.display = 'inline-block';
    resetBtn.style.display = 'none';
    answerContainer.style.display = 'none';
}

// Event listeners
startBtn.addEventListener('click', () => {
    startGame();
    startBtn.style.display = 'none';
});

resetBtn.addEventListener('click', resetGame);

submitBtn.addEventListener('click', checkAnswer);

answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// Sayfa yüklendiğinde
window.addEventListener('load', () => {
    answerInput.focus();
});
