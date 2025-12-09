// Quiz data
const logos = [
    { number: 1, answer: 'michelin', image: 'images/logo1.png' },
    { number: 2, answer: 'paramount', image: 'images/logo2.png' },
    { number: 3, answer: 'tic tac', image: 'images/logo3.png' },
    { number: 4, answer: 'fila', image: 'images/logo4.png' },
    { number: 5, answer: 'mini', image: 'images/logo5.png' },
    { number: 6, answer: 'kfc', image: 'images/logo6.png' },
    { number: 7, answer: 'sony ericsson', image: 'images/logo7.png' },
    { number: 8, answer: 'national geographic', image: 'images/logo8.png' },
    { number: 9, answer: 'heinz', image: 'images/logo9.png' },
    { number: 10, answer: 'cartoon network', image: 'images/logo10.png' },
    { number: 11, answer: 'bic', image: 'images/logo11.png' },
    { number: 12, answer: 'dunkin donuts', image: 'images/logo12.png' },
    { number: 13, answer: 'wikipedia', image: 'images/logo13.png' },
    { number: 14, answer: 'del monte', image: 'images/logo14.png' }
];

// Game state
let currentLogoIndex = 0;
let score = 0;
let timeRemaining = 10;
let timePerLogo = 10; // Time allowed for each logo (10 seconds default)
let timerInterval = null;
let userAnswers = [];
let isProcessingAnswer = false; // Flag to prevent timer issues
let playerName = '';

// DOM Elements
const introScreen = document.getElementById('introScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');
const startBtn = document.getElementById('startBtn');
const nameInput = document.getElementById('nameInput');
const timerDisplay = document.getElementById('timer');
const progressDisplay = document.getElementById('progress');
const scoreDisplay = document.getElementById('score');
const logoNumber = document.getElementById('logoNumber');
const logoImage = document.getElementById('logoImage');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');
const finalScore = document.getElementById('finalScore');
const resultsBreakdown = document.getElementById('resultsBreakdown');
const restartBtn = document.getElementById('restartBtn');

// Event Listeners
startBtn.addEventListener('click', startQuiz);
submitBtn.addEventListener('click', submitAnswer);
restartBtn.addEventListener('click', resetQuiz);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitAnswer();
    }
});

// Start Quiz
function startQuiz() {
    // Get player name
    playerName = nameInput.value.trim() || 'Anonymous';

    introScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');

    loadLogo(); // loadLogo will start the timer
}

// Load Logo
function loadLogo() {
    // Reset processing flag
    isProcessingAnswer = false;

    const logo = logos[currentLogoIndex];
    logoNumber.textContent = `LOGO # ${logo.number}`;
    logoImage.src = logo.image;
    progressDisplay.textContent = `Logo ${currentLogoIndex + 1} / ${logos.length}`;
    scoreDisplay.textContent = `Score: ${score}`;
    answerInput.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    answerInput.focus();

    // Reset timer for this logo
    timeRemaining = timePerLogo;
    timerDisplay.classList.remove('warning');
    updateTimerDisplay();

    // Restart the timer
    clearInterval(timerInterval); // Clear any existing timer
    timerInterval = null; // Reset the interval variable
    startTimer();
}

// Start Timer
function startTimer() {
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        // If we're already processing an answer, stop the timer
        if (isProcessingAnswer) {
            clearInterval(timerInterval);
            timerInterval = null;
            return;
        }

        if (timeRemaining <= 0) {
            // Time's up - stop immediately before going negative
            clearInterval(timerInterval);
            timerInterval = null;
            isProcessingAnswer = true;
            autoSkipLogo();
            return;
        }

        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 5) {
            timerDisplay.classList.add('warning');
        }
    }, 1000);
}

// Auto skip when time runs out
function autoSkipLogo() {
    userAnswers.push({
        logo: logos[currentLogoIndex].number,
        correct: false,
        userAnswer: 'Time out',
        correctAnswer: logos[currentLogoIndex].answer,
        skipped: true
    });

    feedback.textContent = `Time's up! It was ${logos[currentLogoIndex].answer}`;
    feedback.className = 'feedback incorrect';

    setTimeout(() => {
        currentLogoIndex++;
        if (currentLogoIndex < logos.length) {
            loadLogo();
        } else {
            endQuiz();
        }
    }, 1500);
}

// Update Timer Display
function updateTimerDisplay() {
    // Don't show negative time
    const displayTime = Math.max(0, timeRemaining);
    const minutes = Math.floor(displayTime / 60);
    const seconds = displayTime % 60;
    timerDisplay.textContent = minutes > 0
        ? `${minutes}:${seconds.toString().padStart(2, '0')}`
        : `${seconds}s`;
}

// Submit Answer
function submitAnswer() {
    // Prevent double submission
    if (isProcessingAnswer) {
        return;
    }

    // Stop the timer when answer is submitted
    isProcessingAnswer = true;
    clearInterval(timerInterval);
    timerInterval = null;

    const userAnswer = answerInput.value.trim().toLowerCase();
    const correctAnswer = logos[currentLogoIndex].answer.toLowerCase();

    if (!userAnswer) {
        // Treat empty answer as skipped
        userAnswers.push({
            logo: logos[currentLogoIndex].number,
            correct: false,
            userAnswer: 'No answer',
            correctAnswer: logos[currentLogoIndex].answer,
            skipped: true
        });

        feedback.textContent = `Skipped! It was ${logos[currentLogoIndex].answer}`;
        feedback.className = 'feedback incorrect';

        setTimeout(() => {
            currentLogoIndex++;
            if (currentLogoIndex < logos.length) {
                loadLogo();
            } else {
                endQuiz();
            }
        }, 1500);
        return;
    }

    // Normalize answers for comparison
    const normalizedUser = userAnswer.replace(/[^a-z0-9]/g, '');
    const normalizedCorrect = correctAnswer.replace(/[^a-z0-9]/g, '');

    const isCorrect = normalizedUser === normalizedCorrect || userAnswer === correctAnswer;

    if (isCorrect) {
        score++;
        feedback.textContent = '✓ Correct!';
        feedback.className = 'feedback correct';
        userAnswers.push({
            logo: logos[currentLogoIndex].number,
            correct: true,
            userAnswer: userAnswer,
            correctAnswer: logos[currentLogoIndex].answer
        });
    } else {
        feedback.textContent = `✗ Wrong! It was ${logos[currentLogoIndex].answer}`;
        feedback.className = 'feedback incorrect';
        userAnswers.push({
            logo: logos[currentLogoIndex].number,
            correct: false,
            userAnswer: userAnswer,
            correctAnswer: logos[currentLogoIndex].answer
        });
    }

    scoreDisplay.textContent = `Score: ${score}`;

    setTimeout(() => {
        currentLogoIndex++;
        if (currentLogoIndex < logos.length) {
            loadLogo();
        } else {
            endQuiz();
        }
    }, 1500);
}

// Skip Question
function skipQuestion() {
    userAnswers.push({
        logo: logos[currentLogoIndex].number,
        correct: false,
        userAnswer: 'Skipped',
        correctAnswer: logos[currentLogoIndex].answer,
        skipped: true
    });

    feedback.textContent = `Skipped! It was ${logos[currentLogoIndex].answer}`;
    feedback.className = 'feedback incorrect';

    setTimeout(() => {
        currentLogoIndex++;
        if (currentLogoIndex < logos.length) {
            loadLogo();
        } else {
            endQuiz();
        }
    }, 1500);
}

// End Quiz
function endQuiz() {
    clearInterval(timerInterval);
    quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    const percentage = Math.round((score / logos.length) * 100);
    finalScore.innerHTML = `
        <strong>${playerName}</strong>, you scored <strong>${score}</strong> out of <strong>${logos.length}</strong><br>
        <span style="font-size: 1.5rem;">(${percentage}%)</span>
    `;

    // Show breakdown
    let breakdownHTML = `<h3 style="margin-bottom: 15px;">${playerName}'s Results:</h3>`;
    userAnswers.forEach((answer) => {
        const className = answer.correct ? 'correct' : (answer.skipped ? 'skipped' : 'incorrect');
        const status = answer.correct ? '✓' : (answer.skipped ? '⊘' : '✗');
        breakdownHTML += `
            <div class="result-item ${className}">
                <div>
                    <strong>Logo ${answer.logo}:</strong> ${answer.correctAnswer}
                </div>
                <div style="font-size: 0.9rem; margin-top: 5px;">
                    ${status} <strong>${playerName}:</strong> ${answer.userAnswer}
                </div>
            </div>
        `;
    });
    resultsBreakdown.innerHTML = breakdownHTML;
}

// Reset Quiz
function resetQuiz() {
    // Clear any existing timer
    clearInterval(timerInterval);
    timerInterval = null;

    currentLogoIndex = 0;
    score = 0;
    timePerLogo = 10;
    timeRemaining = 10;
    userAnswers = [];
    isProcessingAnswer = false;
    playerName = '';

    resultsScreen.classList.add('hidden');
    introScreen.classList.remove('hidden');
    timerDisplay.classList.remove('warning');
}
