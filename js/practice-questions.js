/**
 * MekkawyMedLearn - Practice Questions Engine
 * Handles quiz functionality, scoring, and progress tracking
 */

// Sample question bank - In production, load from database/API
const questionBank = {
  neurology: [
    {
      id: 'neuro_1',
      topic: 'Neurology',
      difficulty: 'medium',
      stem: `<p>A 65-year-old man presents with progressive memory loss over the past 2 years. His wife reports that he frequently forgets recent conversations and has difficulty managing their finances. Physical exam is unremarkable. MRI shows diffuse cortical atrophy, predominantly in the temporal and parietal lobes.</p>`,
      question: 'Which of the following is the most likely diagnosis?',
      options: [
        'Vascular dementia',
        'Alzheimer\'s disease',
        'Normal pressure hydrocephalus',
        'Frontotemporal dementia',
        'Lewy body dementia'
      ],
      correctIndex: 1,
      explanation: `<p><strong>B. Alzheimer's disease</strong> is correct. The clinical presentation of progressive memory loss affecting daily functioning, combined with MRI findings of diffuse cortical atrophy (especially temporal and parietal), is classic for Alzheimer's disease.</p>
      <p><strong>Key Points:</strong></p>
      <ul>
        <li>Most common cause of dementia (60-80% of cases)</li>
        <li>Gradual onset with progressive decline</li>
        <li>Memory impairment is the hallmark early symptom</li>
        <li>Imaging shows atrophy, especially in hippocampus and temporal lobes</li>
      </ul>`
    },
    {
      id: 'neuro_2',
      topic: 'Neurology',
      difficulty: 'hard',
      stem: `<p>A 55-year-old woman presents with a 6-month history of personality changes and inappropriate social behavior. She has been making rude comments and has started eating excessively. Memory is relatively preserved. MRI shows frontal lobe atrophy.</p>`,
      question: 'What is the most likely diagnosis?',
      options: [
        'Alzheimer\'s disease',
        'Vascular dementia',
        'Frontotemporal dementia',
        'Creutzfeldt-Jakob disease',
        'Pick\'s disease'
      ],
      correctIndex: 2,
      explanation: `<p><strong>C. Frontotemporal dementia</strong> is correct. The behavioral variant presents with personality changes, disinhibition, and executive dysfunction with relatively preserved memory early on. Frontal atrophy on imaging supports this diagnosis.</p>`
    },
    {
      id: 'neuro_3',
      topic: 'Neurology',
      difficulty: 'easy',
      stem: `<p>A patient presents with resting tremor, bradykinesia, and cogwheel rigidity. Symptoms started on the left side and have gradually spread to include both sides.</p>`,
      question: 'What is the most likely diagnosis?',
      options: [
        'Essential tremor',
        'Parkinson\'s disease',
        'Multiple system atrophy',
        'Drug-induced parkinsonism',
        'Wilson\'s disease'
      ],
      correctIndex: 1,
      explanation: `<p><strong>B. Parkinson's disease</strong> is correct. The classic triad of resting tremor, bradykinesia, and rigidity with asymmetric onset is pathognomonic for idiopathic Parkinson's disease.</p>`
    }
  ],
  cardiology: [
    {
      id: 'cardio_1',
      topic: 'Cardiology',
      difficulty: 'medium',
      stem: `<p>A 58-year-old man presents to the ED with crushing chest pain radiating to his left arm. ECG shows ST elevation in leads V1-V4. Troponin is elevated.</p>`,
      question: 'What is the most appropriate immediate management?',
      options: [
        'Schedule stress test for next week',
        'Start aspirin and arrange urgent PCI',
        'Discharge with nitroglycerin prescription',
        'Order echocardiogram',
        'Give IV fluids and observe'
      ],
      correctIndex: 1,
      explanation: `<p><strong>B. Start aspirin and arrange urgent PCI</strong> is correct. This is an anterior STEMI requiring emergent reperfusion therapy. Time is muscle!</p>
      <ul>
        <li>Door-to-balloon time goal: &lt;90 minutes</li>
        <li>DAPT (aspirin + P2Y12 inhibitor) should be started immediately</li>
        <li>Anticoagulation with heparin</li>
      </ul>`
    },
    {
      id: 'cardio_2',
      topic: 'Cardiology',
      difficulty: 'easy',
      stem: `<p>A 45-year-old woman presents with palpitations. ECG shows irregularly irregular rhythm with no discernible P waves and a ventricular rate of 110 bpm.</p>`,
      question: 'What is the diagnosis?',
      options: [
        'Atrial flutter',
        'Atrial fibrillation',
        'Multifocal atrial tachycardia',
        'Ventricular tachycardia',
        'Sinus tachycardia with PACs'
      ],
      correctIndex: 1,
      explanation: `<p><strong>B. Atrial fibrillation</strong> is correct. The hallmarks are irregularly irregular rhythm and absence of P waves, with fibrillatory waves sometimes visible.</p>`
    }
  ],
  pharmacology: [
    {
      id: 'pharm_1',
      topic: 'Pharmacology',
      difficulty: 'medium',
      stem: `<p>A patient on lisinopril develops a persistent dry cough that is significantly affecting their quality of life.</p>`,
      question: 'What is the best alternative antihypertensive medication?',
      options: [
        'Enalapril',
        'Captopril',
        'Losartan',
        'Ramipril',
        'Benazepril'
      ],
      correctIndex: 2,
      explanation: `<p><strong>C. Losartan</strong> is correct. ARBs (angiotensin receptor blockers) like losartan provide similar benefits to ACE inhibitors but without the cough side effect, which is caused by bradykinin accumulation.</p>`
    }
  ]
};

class PracticeQuiz {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.selectedAnswer = null;
    this.answered = false;
    this.score = { correct: 0, incorrect: 0 };
    this.answers = [];
    this.timerInterval = null;
    this.timePerQuestion = 90; // seconds
    this.timeRemaining = this.timePerQuestion;
    this.isTimed = false;
    this.startTime = null;

    this.initElements();
    this.initEventListeners();
    this.loadQuestions();
  }

  initElements() {
    this.practiceArea = document.getElementById('practiceArea');
    this.resultsSummary = document.getElementById('resultsSummary');
    this.questionStem = document.getElementById('questionStem');
    this.questionTopic = document.getElementById('questionTopic');
    this.questionDifficulty = document.getElementById('questionDifficulty');
    this.answerOptions = document.getElementById('answerOptions');
    this.explanationPanel = document.getElementById('explanationPanel');
    this.explanationContent = document.getElementById('explanationContent');
    this.resultBadge = document.getElementById('resultBadge');
    this.submitBtn = document.getElementById('submitBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.currentQuestionEl = document.getElementById('currentQuestion');
    this.totalQuestionsEl = document.getElementById('totalQuestions');
    this.progressBar = document.getElementById('quizProgressBar');
    this.timer = document.getElementById('timer');
    this.timeRemainingEl = document.getElementById('timeRemaining');
    this.announcer = document.getElementById('announcer');
  }

  initEventListeners() {
    // Start quiz button
    document.getElementById('startQuizBtn')?.addEventListener('click', () => {
      this.startQuiz();
    });

    // Answer options
    this.answerOptions?.addEventListener('click', (e) => {
      const option = e.target.closest('.answer-option');
      if (option && !this.answered) {
        this.selectAnswer(parseInt(option.dataset.index));
      }
    });

    // Submit button
    this.submitBtn?.addEventListener('click', () => {
      if (this.selectedAnswer !== null) {
        this.submitAnswer();
      }
    });

    // Next button
    this.nextBtn?.addEventListener('click', () => {
      this.nextQuestion();
    });

    // Results actions
    document.getElementById('newQuizBtn')?.addEventListener('click', () => {
      this.resetQuiz();
    });

    document.getElementById('reviewMissedBtn')?.addEventListener('click', () => {
      this.reviewMissed();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  handleKeyPress(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // A-E for answer selection
    const keyMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4 };
    const key = e.key.toLowerCase();

    if (keyMap[key] !== undefined && !this.answered) {
      this.selectAnswer(keyMap[key]);
    } else if (e.key === 'Enter') {
      if (this.answered) {
        this.nextQuestion();
      } else if (this.selectedAnswer !== null) {
        this.submitAnswer();
      }
    }
  }

  loadQuestions() {
    const topic = document.getElementById('topicSelect')?.value || 'all';
    const difficulty = document.getElementById('difficultySelect')?.value || 'all';

    // Gather questions from all topics or specific topic
    let allQuestions = [];
    if (topic === 'all') {
      Object.values(questionBank).forEach(questions => {
        allQuestions = allQuestions.concat(questions);
      });
    } else {
      allQuestions = questionBank[topic] || [];
    }

    // Filter by difficulty
    if (difficulty !== 'all') {
      allQuestions = allQuestions.filter(q => q.difficulty === difficulty);
    }

    // Shuffle
    this.questions = this.shuffleArray([...allQuestions]);
    
    if (this.totalQuestionsEl) {
      this.totalQuestionsEl.textContent = this.questions.length;
    }
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  startQuiz() {
    this.loadQuestions();
    
    if (this.questions.length === 0) {
      this.announce('No questions available for selected filters');
      return;
    }

    this.currentIndex = 0;
    this.score = { correct: 0, incorrect: 0 };
    this.answers = [];
    this.startTime = Date.now();

    // Check if timed mode
    const mode = document.getElementById('modeSelect')?.value;
    this.isTimed = mode === 'timed' || mode === 'exam';

    this.showQuestion();
    this.announce(`Quiz started with ${this.questions.length} questions`);
  }

  showQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.showResults();
      return;
    }

    const question = this.questions[this.currentIndex];
    this.selectedAnswer = null;
    this.answered = false;

    // Update question content
    if (this.questionStem) {
      this.questionStem.innerHTML = question.stem + 
        `<p class="question-prompt"><strong>${question.question}</strong></p>`;
    }
    if (this.questionTopic) {
      this.questionTopic.textContent = question.topic;
    }
    if (this.questionDifficulty) {
      this.questionDifficulty.textContent = question.difficulty.charAt(0).toUpperCase() + 
        question.difficulty.slice(1);
    }

    // Render options
    this.renderOptions(question.options);

    // Update progress
    this.updateProgress();

    // Hide explanation, show submit
    this.explanationPanel?.setAttribute('hidden', '');
    this.submitBtn?.removeAttribute('hidden');
    this.nextBtn?.setAttribute('hidden', '');

    // Start timer if timed mode
    if (this.isTimed) {
      this.startTimer();
    }
  }

  renderOptions(options) {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    if (this.answerOptions) {
      this.answerOptions.innerHTML = options.map((opt, i) => `
        <button class="answer-option" data-index="${i}" aria-label="Option ${letters[i]}: ${opt}">
          <span class="answer-option-letter">${letters[i]}</span>
          <span class="answer-text">${opt}</span>
        </button>
      `).join('');
    }
  }

  selectAnswer(index) {
    if (this.answered) return;

    this.selectedAnswer = index;

    // Update UI
    document.querySelectorAll('.answer-option').forEach((opt, i) => {
      opt.classList.toggle('selected', i === index);
    });

    const letters = ['A', 'B', 'C', 'D', 'E'];
    this.announce(`Selected option ${letters[index]}`);
  }

  submitAnswer() {
    if (this.selectedAnswer === null || this.answered) return;

    this.answered = true;
    this.stopTimer();

    const question = this.questions[this.currentIndex];
    const isCorrect = this.selectedAnswer === question.correctIndex;

    // Update score
    if (isCorrect) {
      this.score.correct++;
    } else {
      this.score.incorrect++;
    }

    // Record answer
    this.answers.push({
      questionId: question.id,
      selected: this.selectedAnswer,
      correct: question.correctIndex,
      isCorrect
    });

    // Update UI
    this.showFeedback(isCorrect, question);
  }

  showFeedback(isCorrect, question) {
    const options = document.querySelectorAll('.answer-option');
    
    // Mark correct and incorrect
    options.forEach((opt, i) => {
      if (i === question.correctIndex) {
        opt.classList.add('correct');
      } else if (i === this.selectedAnswer && !isCorrect) {
        opt.classList.add('incorrect');
      }
      opt.disabled = true;
    });

    // Update result badge
    if (this.resultBadge) {
      this.resultBadge.className = `result-badge ${isCorrect ? 'correct' : 'incorrect'}`;
      this.resultBadge.innerHTML = isCorrect ? `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Correct!
      ` : `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        Incorrect
      `;
    }

    // Show explanation
    if (this.explanationContent) {
      this.explanationContent.innerHTML = `<h4>Explanation</h4>${question.explanation}`;
    }
    this.explanationPanel?.removeAttribute('hidden');

    // Toggle buttons
    this.submitBtn?.setAttribute('hidden', '');
    this.nextBtn?.removeAttribute('hidden');

    this.announce(isCorrect ? 'Correct!' : 'Incorrect. See explanation below.');
  }

  nextQuestion() {
    this.currentIndex++;
    this.showQuestion();
  }

  updateProgress() {
    const progress = ((this.currentIndex + 1) / this.questions.length) * 100;
    if (this.progressBar) this.progressBar.style.width = `${progress}%`;
    if (this.currentQuestionEl) this.currentQuestionEl.textContent = this.currentIndex + 1;
  }

  startTimer() {
    this.timeRemaining = this.timePerQuestion;
    this.timer?.removeAttribute('hidden');
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();

      if (this.timeRemaining <= 0) {
        this.timeUp();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    if (!this.timeRemainingEl) return;

    const mins = Math.floor(this.timeRemaining / 60);
    const secs = this.timeRemaining % 60;
    this.timeRemainingEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

    // Warning colors
    if (this.timer) {
      this.timer.classList.remove('warning', 'danger');
      if (this.timeRemaining <= 10) {
        this.timer.classList.add('danger');
      } else if (this.timeRemaining <= 30) {
        this.timer.classList.add('warning');
      }
    }
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  timeUp() {
    this.stopTimer();
    this.announce('Time is up!');
    
    // Auto-submit with no answer if not selected
    if (this.selectedAnswer === null) {
      this.selectedAnswer = -1; // Mark as unanswered
    }
    this.submitAnswer();
  }

  showResults() {
    this.stopTimer();
    
    const total = this.questions.length;
    const percent = Math.round((this.score.correct / total) * 100);
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const avgTime = Math.round(elapsed / total);

    // Update UI
    this.practiceArea?.setAttribute('hidden', '');
    this.resultsSummary?.removeAttribute('hidden');

    document.getElementById('scorePercent').textContent = `${percent}%`;
    document.getElementById('correctAnswers').textContent = this.score.correct;
    document.getElementById('incorrectAnswers').textContent = this.score.incorrect;
    document.getElementById('avgTime').textContent = `${avgTime}s`;

    // Update score ring
    const scoreRing = document.getElementById('scoreRing');
    if (scoreRing) {
      const circumference = 100;
      const offset = circumference - (percent / 100) * circumference;
      scoreRing.setAttribute('stroke-dashoffset', offset);
    }

    // Generate topic breakdown
    this.generateTopicBreakdown();

    this.saveProgress();
    this.announce(`Quiz complete! You scored ${percent}%`);
  }

  generateTopicBreakdown() {
    const topicStats = {};

    this.answers.forEach((answer, i) => {
      const question = this.questions[i];
      if (!topicStats[question.topic]) {
        topicStats[question.topic] = { correct: 0, total: 0 };
      }
      topicStats[question.topic].total++;
      if (answer.isCorrect) {
        topicStats[question.topic].correct++;
      }
    });

    const topicBars = document.getElementById('topicBars');
    if (topicBars) {
      topicBars.innerHTML = Object.entries(topicStats).map(([topic, stats]) => {
        const percent = Math.round((stats.correct / stats.total) * 100);
        return `
          <div class="topic-bar">
            <span class="topic-name">${topic}</span>
            <div class="topic-progress">
              <div class="topic-progress-fill" style="width: ${percent}%"></div>
            </div>
            <span class="topic-score">${stats.correct}/${stats.total}</span>
          </div>
        `;
      }).join('');
    }
  }

  resetQuiz() {
    this.practiceArea?.removeAttribute('hidden');
    this.resultsSummary?.setAttribute('hidden', '');
    this.timer?.setAttribute('hidden', '');
    this.startQuiz();
  }

  reviewMissed() {
    // Filter to only missed questions
    const missedIds = this.answers
      .filter(a => !a.isCorrect)
      .map(a => a.questionId);

    if (missedIds.length === 0) {
      this.announce('Congratulations! You got all questions correct.');
      return;
    }

    // Create review set
    const allQuestions = Object.values(questionBank).flat();
    this.questions = allQuestions.filter(q => missedIds.includes(q.id));
    
    this.currentIndex = 0;
    this.score = { correct: 0, incorrect: 0 };
    this.answers = [];
    this.startTime = Date.now();
    this.isTimed = false;

    this.practiceArea?.removeAttribute('hidden');
    this.resultsSummary?.setAttribute('hidden', '');
    this.timer?.setAttribute('hidden', '');

    if (this.totalQuestionsEl) {
      this.totalQuestionsEl.textContent = this.questions.length;
    }

    this.showQuestion();
    this.announce(`Reviewing ${this.questions.length} missed questions`);
  }

  saveProgress() {
    try {
      const progress = JSON.parse(localStorage.getItem('practice_progress') || '{}');
      
      // Save session stats
      if (!progress.sessions) progress.sessions = [];
      progress.sessions.push({
        date: new Date().toISOString(),
        correct: this.score.correct,
        total: this.questions.length,
        topics: [...new Set(this.questions.map(q => q.topic))]
      });

      // Keep last 50 sessions
      progress.sessions = progress.sessions.slice(-50);

      localStorage.setItem('practice_progress', JSON.stringify(progress));
    } catch (e) {
      console.log('Could not save practice progress:', e);
    }
  }

  announce(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
      setTimeout(() => {
        this.announcer.textContent = '';
      }, 1000);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('practiceArea')) {
    window.practiceQuiz = new PracticeQuiz();
  }
});
