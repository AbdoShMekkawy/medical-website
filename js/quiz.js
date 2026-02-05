/**
 * MekkawyMedLearn - Quiz Functionality
 */

(function() {
  // Quiz state
  const state = {
    currentQuestion: 0,
    score: 0,
    answers: [],
    questions: [
      {
        question: "Which plane divides the body into anterior and posterior portions?",
        options: ["Sagittal Plane", "Coronal (Frontal) Plane", "Transverse (Horizontal) Plane", "Oblique Plane"],
        correct: 1,
        explanation: "The Coronal (Frontal) Plane divides the body into anterior (front) and posterior (back) portions."
      },
      {
        question: "The heart is located in which body cavity?",
        options: ["Abdominal cavity", "Thoracic cavity", "Pelvic cavity", "Cranial cavity"],
        correct: 1,
        explanation: "The heart is located in the thoracic cavity, specifically in the mediastinum."
      },
      {
        question: "Which term describes a structure closer to the midline of the body?",
        options: ["Lateral", "Medial", "Proximal", "Distal"],
        correct: 1,
        explanation: "Medial means closer to the midline, while lateral means farther from the midline."
      }
    ]
  };

  const optionsList = document.getElementById('optionsList');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const explanation = document.getElementById('explanation');

  // Initialize quiz
  function init() {
    if (!optionsList) return;

    // Set up option click handlers
    optionsList.addEventListener('click', (e) => {
      const option = e.target.closest('.option');
      if (!option || option.classList.contains('correct') || option.classList.contains('incorrect')) return;

      selectOption(option);
    });

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => navigateQuestion(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => navigateQuestion(1));
    }
  }

  // Select an option
  function selectOption(optionEl) {
    const options = optionsList.querySelectorAll('.option');
    const selectedIndex = Array.from(options).indexOf(optionEl);
    const currentQ = state.questions[state.currentQuestion];
    const isCorrect = selectedIndex === currentQ.correct;

    // Clear previous selections
    options.forEach(opt => opt.classList.remove('selected'));

    // Mark selection
    optionEl.classList.add('selected');
    
    // Show result
    if (isCorrect) {
      optionEl.classList.add('correct');
      state.score++;
    } else {
      optionEl.classList.add('incorrect');
      options[currentQ.correct].classList.add('correct');
    }

    // Store answer
    state.answers[state.currentQuestion] = selectedIndex;

    // Show explanation
    if (explanation) {
      explanation.style.display = 'block';
      explanation.innerHTML = `
        <strong style="color:${isCorrect ? 'var(--secondary-700)' : 'var(--error)'};">
          ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
        </strong>
        <p style="margin:0.5rem 0 0;color:var(--text-secondary);font-size:0.875rem;">
          ${currentQ.explanation}
        </p>
      `;
      explanation.style.background = isCorrect ? 'var(--secondary-100)' : 'rgba(239, 68, 68, 0.1)';
      explanation.style.borderColor = isCorrect ? 'var(--secondary-500)' : 'var(--error)';
    }

    // Update button text
    if (nextBtn) {
      nextBtn.textContent = state.currentQuestion === state.questions.length - 1 ? 'See Results' : 'Next Question';
    }
  }

  // Navigate questions
  function navigateQuestion(direction) {
    const newIndex = state.currentQuestion + direction;
    
    if (newIndex < 0 || newIndex >= state.questions.length) {
      if (newIndex >= state.questions.length) {
        showResults();
      }
      return;
    }

    state.currentQuestion = newIndex;
    renderQuestion();
  }

  // Render current question
  function renderQuestion() {
    const q = state.questions[state.currentQuestion];
    
    document.querySelector('.question-number').textContent = 
      `Question ${state.currentQuestion + 1} of ${state.questions.length}`;
    document.querySelector('.question-text').textContent = q.question;

    // Update progress
    const progress = ((state.currentQuestion + 1) / state.questions.length) * 100;
    document.querySelector('.quiz-progress-fill').style.width = `${progress}%`;

    // Render options
    optionsList.innerHTML = q.options.map((opt, i) => `
      <label class="option" data-option="${String.fromCharCode(97 + i)}">
        <span class="option-letter">${String.fromCharCode(65 + i)}</span>
        <span class="option-text">${opt}</span>
      </label>
    `).join('');

    // Hide explanation
    if (explanation) explanation.style.display = 'none';

    // Update navigation
    if (prevBtn) prevBtn.disabled = state.currentQuestion === 0;
    if (nextBtn) nextBtn.textContent = 'Next Question';
  }

  // Show final results
  function showResults() {
    const container = document.querySelector('.quiz-container');
    if (!container) return;

    const percentage = Math.round((state.score / state.questions.length) * 100);
    
    container.innerHTML = `
      <div class="quiz-result">
        <div style="width:120px;height:120px;margin:0 auto var(--space-6);background:var(--gradient-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:3rem;">🎉</span>
        </div>
        <h2 style="font-size:var(--text-3xl);margin-bottom:var(--space-4);">Quiz Complete!</h2>
        <div class="result-score">${state.score}/${state.questions.length}</div>
        <p style="color:var(--text-secondary);margin-bottom:var(--space-2);">You scored ${percentage}%</p>
        <p style="color:var(--text-tertiary);margin-bottom:var(--space-8);">${
          percentage >= 80 ? 'Excellent work! 🏆' : 
          percentage >= 60 ? 'Good job! Keep learning! 📚' : 
          'Keep practicing! You\'ll get there! 💪'
        }</p>
        <div style="display:flex;gap:var(--space-4);justify-content:center;">
          <a href="lesson.html" class="btn btn-secondary">Back to Lesson</a>
          <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
        </div>
      </div>
    `;
  }

  // Initialize
  init();
})();
