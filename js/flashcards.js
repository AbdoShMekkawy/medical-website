/**
 * MekkawyMedLearn - Flashcard System
 * Implements spaced repetition learning with SM-2 algorithm
 */

// Sample flashcard data - In production, this would be loaded from a database or API
const flashcardDecks = {
  neurology: {
    name: 'Neurology',
    icon: '🧠',
    cards: [
      {
        id: 1,
        question: 'What is the most common cause of dementia?',
        answer: '<strong>Alzheimer\'s Disease</strong><p>Accounts for 60-80% of dementia cases. Characterized by amyloid plaques and neurofibrillary tangles.</p>',
        category: 'Dementia'
      },
      {
        id: 2,
        question: 'What are the cardinal features of Parkinson\'s disease?',
        answer: '<strong>TRAP</strong><p><strong>T</strong>remor (resting)<br><strong>R</strong>igidity (cogwheel)<br><strong>A</strong>kinesia/Bradykinesia<br><strong>P</strong>ostural instability</p>',
        category: 'Movement Disorders'
      },
      {
        id: 3,
        question: 'What is the classic triad of Normal Pressure Hydrocephalus?',
        answer: '<strong>"Wet, Wacky, and Wobbly"</strong><p><strong>Urinary incontinence</strong><br><strong>Dementia</strong><br><strong>Gait disturbance</strong> (magnetic gait)</p>',
        category: 'Hydrocephalus'
      },
      {
        id: 4,
        question: 'What are the Red Flag symptoms in headache evaluation?',
        answer: '<strong>SNOOP</strong><p><strong>S</strong>ystemic symptoms/signs<br><strong>N</strong>eurologic symptoms<br><strong>O</strong>nset sudden (thunderclap)<br><strong>O</strong>lder age (>50 new onset)<br><strong>P</strong>attern change</p>',
        category: 'Headache'
      },
      {
        id: 5,
        question: 'What is the difference between Upper and Lower Motor Neuron lesions?',
        answer: '<strong>UMN:</strong> Spasticity, hyperreflexia, Babinski+, no atrophy<br><br><strong>LMN:</strong> Flaccidity, hyporeflexia, fasciculations, muscle atrophy',
        category: 'Motor Pathways'
      }
    ]
  },
  cardiology: {
    name: 'Cardiology',
    icon: '🫀',
    cards: [
      {
        id: 1,
        question: 'What are the criteria for diagnosing a STEMI?',
        answer: '<strong>ST elevation criteria:</strong><p>- ≥1mm in 2 contiguous limb leads<br>- ≥2mm in 2 contiguous chest leads<br>- New LBBB with symptoms</p>',
        category: 'ACS'
      },
      {
        id: 2,
        question: 'What is the treatment sequence for STEMI?',
        answer: '<strong>MONA-B</strong><p><strong>M</strong>orphine<br><strong>O</strong>xygen (if SpO2 <94%)<br><strong>N</strong>itrates<br><strong>A</strong>spirin<br><strong>B</strong>eta-blockers</p><p>+ Urgent PCI or thrombolytics</p>',
        category: 'ACS'
      },
      {
        id: 3,
        question: 'What are the causes of elevated Troponin other than MI?',
        answer: '<strong>Type 2 MI causes:</strong><p>- Sepsis<br>- PE<br>- Heart failure<br>- Myocarditis<br>- Renal failure<br>- Arrhythmias<br>- Cardiac contusion</p>',
        category: 'Cardiac Biomarkers'
      }
    ]
  },
  pharmacology: {
    name: 'Pharmacology',
    icon: '💊',
    cards: [
      {
        id: 1,
        question: 'What are the side effects of ACE inhibitors?',
        answer: '<strong>CAPTOPRIL</strong><p><strong>C</strong>ough (dry)<br><strong>A</strong>ngioedema<br><strong>P</strong>otassium elevation<br><strong>T</strong>eratogenic<br><strong>O</strong>rthostatic hypotension<br><strong>P</strong>roteinuria<br><strong>R</strong>ash<br><strong>I</strong>mpaired taste<br><strong>L</strong>eukopenia</p>',
        category: 'Cardiovascular'
      },
      {
        id: 2,
        question: 'What is the mechanism of action of Beta Blockers?',
        answer: '<strong>Block β-adrenergic receptors</strong><p>β1: Decrease HR, contractility, renin release<br>β2: Bronchoconstriction (non-selective)</p><p>Results in: ↓BP, ↓HR, ↓O2 demand</p>',
        category: 'Cardiovascular'
      }
    ]
  }
};

class FlashcardApp {
  constructor() {
    this.currentDeck = 'neurology';
    this.cards = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.sessionStats = {
      cardsStudied: 0,
      ratings: { 1: 0, 2: 0, 3: 0, 4: 0 },
      startTime: Date.now()
    };
    this.progress = this.loadProgress();

    this.initElements();
    this.initEventListeners();
    this.loadDeck(this.currentDeck);
  }

  initElements() {
    this.flashcard = document.getElementById('flashcard');
    this.flashcardInner = this.flashcard?.querySelector('.flashcard-inner');
    this.questionEl = document.getElementById('cardQuestion');
    this.answerEl = document.getElementById('cardAnswer');
    this.categoryEl = document.getElementById('cardCategory');
    this.currentCardEl = document.getElementById('currentCard');
    this.totalCardsEl = document.getElementById('totalCards');
    this.progressBar = document.getElementById('progressBar');
    this.ratingButtons = document.getElementById('ratingButtons');
    this.deckSelect = document.getElementById('deckSelect');
    this.announcer = document.getElementById('announcer');
    this.sessionSummary = document.getElementById('sessionSummary');
  }

  initEventListeners() {
    // Flashcard flip
    this.flashcard?.addEventListener('click', () => this.flipCard());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));

    // Rating buttons
    document.querySelectorAll('.rating-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating);
        this.rateCard(rating);
      });
    });

    // Deck selector
    this.deckSelect?.addEventListener('change', (e) => {
      this.loadDeck(e.target.value);
    });

    // Continue button
    document.getElementById('continueBtn')?.addEventListener('click', () => {
      this.resetSession();
    });
  }

  handleKeyPress(e) {
    // Prevent handling if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch(e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        this.flipCard();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
        if (this.isFlipped) {
          this.rateCard(parseInt(e.key));
        }
        break;
      case 'ArrowLeft':
        this.previousCard();
        break;
      case 'ArrowRight':
        if (this.isFlipped) {
          this.rateCard(3); // Default to "Good"
        }
        break;
    }
  }

  loadDeck(deckId) {
    this.currentDeck = deckId;
    const deck = flashcardDecks[deckId];
    if (!deck) return;

    this.cards = [...deck.cards];
    this.shuffleCards();
    this.currentIndex = 0;
    this.showCard();
    this.updateStats();
    this.announce(`Loaded ${deck.name} deck with ${this.cards.length} cards`);
  }

  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  showCard() {
    if (this.currentIndex >= this.cards.length) {
      this.showSessionSummary();
      return;
    }

    const card = this.cards[this.currentIndex];
    if (!card) return;

    // Reset flip state
    this.isFlipped = false;
    this.flashcard?.classList.remove('flipped');
    this.ratingButtons?.classList.remove('visible');

    // Update content
    if (this.questionEl) this.questionEl.innerHTML = card.question;
    if (this.answerEl) this.answerEl.innerHTML = card.answer;
    if (this.categoryEl) this.categoryEl.textContent = card.category;

    // Update progress
    this.updateProgress();
  }

  flipCard() {
    if (this.currentIndex >= this.cards.length) return;

    this.isFlipped = !this.isFlipped;
    this.flashcard?.classList.toggle('flipped', this.isFlipped);

    if (this.isFlipped) {
      this.ratingButtons?.classList.add('visible');
      this.announce('Answer revealed. Rate your recall using buttons or keys 1-4');
    } else {
      this.ratingButtons?.classList.remove('visible');
    }
  }

  rateCard(rating) {
    if (!this.isFlipped) return;

    // Record rating
    this.sessionStats.cardsStudied++;
    this.sessionStats.ratings[rating]++;

    // Update card progress using SM-2 algorithm principles
    const card = this.cards[this.currentIndex];
    this.updateCardProgress(card.id, rating);

    // Move to next card
    this.currentIndex++;
    this.showCard();

    const labels = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };
    this.announce(`Rated ${labels[rating]}. ${this.cards.length - this.currentIndex} cards remaining`);
  }

  previousCard() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.showCard();
    }
  }

  updateProgress() {
    const progress = ((this.currentIndex + 1) / this.cards.length) * 100;
    if (this.progressBar) this.progressBar.style.width = `${progress}%`;
    if (this.currentCardEl) this.currentCardEl.textContent = this.currentIndex + 1;
    if (this.totalCardsEl) this.totalCardsEl.textContent = this.cards.length;
  }

  updateStats() {
    // Count cards by state from progress
    const deckProgress = this.progress[this.currentDeck] || {};
    let newCount = 0, reviewCount = 0, masteredCount = 0;

    this.cards.forEach(card => {
      const cardProgress = deckProgress[card.id];
      if (!cardProgress) {
        newCount++;
      } else if (cardProgress.interval >= 7) {
        masteredCount++;
      } else {
        reviewCount++;
      }
    });

    const newEl = document.getElementById('newCount');
    const reviewEl = document.getElementById('reviewCount');
    const masteredEl = document.getElementById('masteredCount');

    if (newEl) newEl.textContent = newCount;
    if (reviewEl) reviewEl.textContent = reviewCount;
    if (masteredEl) masteredEl.textContent = masteredCount;
  }

  // Simplified SM-2 algorithm for spaced repetition
  updateCardProgress(cardId, rating) {
    if (!this.progress[this.currentDeck]) {
      this.progress[this.currentDeck] = {};
    }

    const cardProgress = this.progress[this.currentDeck][cardId] || {
      interval: 0,
      easeFactor: 2.5,
      reviews: 0
    };

    // Update based on rating (1=Again, 2=Hard, 3=Good, 4=Easy)
    if (rating < 3) {
      cardProgress.interval = 0; // Reset for failed cards
    } else {
      if (cardProgress.interval === 0) {
        cardProgress.interval = 1;
      } else if (cardProgress.interval === 1) {
        cardProgress.interval = 6;
      } else {
        cardProgress.interval = Math.round(cardProgress.interval * cardProgress.easeFactor);
      }
    }

    // Adjust ease factor
    cardProgress.easeFactor = Math.max(1.3, 
      cardProgress.easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
    );
    cardProgress.reviews++;
    cardProgress.lastReview = Date.now();

    this.progress[this.currentDeck][cardId] = cardProgress;
    this.saveProgress();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('flashcard_progress');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.log('Could not load flashcard progress:', e);
      return {};
    }
  }

  saveProgress() {
    try {
      localStorage.setItem('flashcard_progress', JSON.stringify(this.progress));
    } catch (e) {
      console.log('Could not save flashcard progress:', e);
    }
  }

  showSessionSummary() {
    const elapsed = Math.floor((Date.now() - this.sessionStats.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    // Update summary stats
    const cardsStudiedEl = document.getElementById('cardsStudied');
    const correctCountEl = document.getElementById('correctCount');
    const timeSpentEl = document.getElementById('timeSpent');

    if (cardsStudiedEl) cardsStudiedEl.textContent = this.sessionStats.cardsStudied;
    if (correctCountEl) {
      correctCountEl.textContent = this.sessionStats.ratings[3] + this.sessionStats.ratings[4];
    }
    if (timeSpentEl) {
      timeSpentEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Show summary, hide flashcard area
    document.querySelector('.flashcard-area')?.setAttribute('hidden', '');
    this.sessionSummary?.removeAttribute('hidden');
    
    this.announce('Session complete! Review your results.');
  }

  resetSession() {
    this.sessionStats = {
      cardsStudied: 0,
      ratings: { 1: 0, 2: 0, 3: 0, 4: 0 },
      startTime: Date.now()
    };
    this.currentIndex = 0;
    this.shuffleCards();

    document.querySelector('.flashcard-area')?.removeAttribute('hidden');
    this.sessionSummary?.setAttribute('hidden', '');

    this.showCard();
    this.updateStats();
  }

  // Screen reader announcements
  announce(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
      // Clear after a delay for next announcement
      setTimeout(() => {
        this.announcer.textContent = '';
      }, 1000);
    }
  }
}

// Initialize flashcard app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('flashcard')) {
    window.flashcardApp = new FlashcardApp();
  }
});
