/**
 * MekkawyMedLearn - Video Playlist Controller
 * Handles video playlist navigation, progress tracking, and tab switching
 */

// Neurology Course Video Playlist Configuration
// Add your videos here in order
const neurologyPlaylist = [
  {
    id: 1,
    title: "Clinical Reasoning Dementia",
    filename: "01- Clinical Reasoning Dementia.mp4",
    duration: null, // Will be calculated automatically
    completed: false
  },
  // Add more videos as you add them to the folder:
  // {
  //   id: 2,
  //   title: "Stroke Assessment",
  //   filename: "02- Stroke Assessment.mp4",
  //   duration: null,
  //   completed: false
  // },
];

class VideoPlaylist {
  constructor(playlist, videoElementId = 'lessonVideo') {
    this.playlist = playlist;
    this.currentIndex = 0;
    this.videoElement = document.getElementById(videoElementId);
    this.videoSource = document.getElementById('videoSource');
    this.playlistContainer = document.getElementById('playlistContainer');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
    this.titleElement = document.getElementById('currentLessonTitle');
    this.durationElement = document.getElementById('videoDuration');
    
    this.basePath = 'videos/neurology/';
    this.storageKey = 'neurology_progress';
    
    this.init();
  }

  init() {
    this.loadProgress();
    this.renderPlaylist();
    this.setupEventListeners();
    this.loadVideo(this.currentIndex);
    this.updateOverallProgress();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const progress = JSON.parse(saved);
        this.playlist.forEach((item, index) => {
          if (progress[item.id]) {
            item.completed = progress[item.id].completed;
          }
        });
        // Resume from last watched
        if (progress.lastIndex !== undefined) {
          this.currentIndex = Math.min(progress.lastIndex, this.playlist.length - 1);
        }
      }
    } catch (e) {
      console.log('Could not load progress:', e);
    }
  }

  saveProgress() {
    try {
      const progress = { lastIndex: this.currentIndex };
      this.playlist.forEach(item => {
        progress[item.id] = { completed: item.completed };
      });
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
    } catch (e) {
      console.log('Could not save progress:', e);
    }
  }

  renderPlaylist() {
    if (!this.playlistContainer) return;

    if (this.playlist.length === 0) {
      this.playlistContainer.innerHTML = `
        <div class="playlist-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="2" y1="7" x2="7" y2="7"/>
            <line x1="2" y1="17" x2="7" y2="17"/>
            <line x1="17" y1="7" x2="22" y2="7"/>
            <line x1="17" y1="17" x2="22" y2="17"/>
          </svg>
          <p>No videos in this course yet.</p>
        </div>
      `;
      return;
    }

    this.playlistContainer.innerHTML = this.playlist.map((item, index) => `
      <div class="playlist-item ${index === this.currentIndex ? 'active' : ''} ${item.completed ? 'completed' : ''}" 
           data-index="${index}">
        <div class="playlist-number">
          ${item.completed ? '✓' : index === this.currentIndex ? '▶' : index + 1}
        </div>
        <div class="playlist-info">
          <div class="playlist-title">${item.title}</div>
          <div class="playlist-duration">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span class="duration-value" data-index="${index}">${item.duration || 'Loading...'}</span>
          </div>
        </div>
        <div class="playing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // Playlist item clicks
    if (this.playlistContainer) {
      this.playlistContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.playlist-item');
        if (item) {
          const index = parseInt(item.dataset.index);
          this.loadVideo(index);
        }
      });
    }

    // Video events
    if (this.videoElement) {
      this.videoElement.addEventListener('loadedmetadata', () => {
        this.updateDuration();
      });

      this.videoElement.addEventListener('ended', () => {
        this.markCompleted(this.currentIndex);
        this.playNext();
      });

      this.videoElement.addEventListener('timeupdate', () => {
        // Mark as completed when watched 90%
        if (this.videoElement.currentTime / this.videoElement.duration > 0.9) {
          this.markCompleted(this.currentIndex);
        }
      });
    }

    // Tab switching
    document.querySelectorAll('.lesson-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
  }

  loadVideo(index) {
    if (index < 0 || index >= this.playlist.length) return;
    
    this.currentIndex = index;
    const item = this.playlist[index];
    
    if (this.videoSource && this.videoElement) {
      this.videoSource.src = this.basePath + encodeURIComponent(item.filename);
      this.videoElement.load();
    }

    if (this.titleElement) {
      this.titleElement.textContent = item.title;
    }

    this.saveProgress();
    this.updatePlaylistUI();
  }

  updatePlaylistUI() {
    document.querySelectorAll('.playlist-item').forEach((item, index) => {
      item.classList.remove('active');
      if (index === this.currentIndex) {
        item.classList.add('active');
      }
      
      const numberEl = item.querySelector('.playlist-number');
      if (numberEl) {
        if (this.playlist[index].completed) {
          numberEl.textContent = '✓';
        } else if (index === this.currentIndex) {
          numberEl.textContent = '▶';
        } else {
          numberEl.textContent = index + 1;
        }
      }
    });

    this.updateOverallProgress();
  }

  updateDuration() {
    if (!this.videoElement) return;
    
    const duration = this.formatDuration(this.videoElement.duration);
    
    // Update current item duration
    this.playlist[this.currentIndex].duration = duration;
    
    // Update UI
    if (this.durationElement) {
      this.durationElement.textContent = duration;
    }
    
    const durationEl = document.querySelector(`.duration-value[data-index="${this.currentIndex}"]`);
    if (durationEl) {
      durationEl.textContent = duration;
    }
  }

  formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  markCompleted(index) {
    if (!this.playlist[index].completed) {
      this.playlist[index].completed = true;
      this.saveProgress();
      this.updatePlaylistUI();
      
      const item = document.querySelector(`.playlist-item[data-index="${index}"]`);
      if (item) {
        item.classList.add('completed');
      }
    }
  }

  playNext() {
    if (this.currentIndex < this.playlist.length - 1) {
      this.loadVideo(this.currentIndex + 1);
      this.videoElement.play();
    }
  }

  updateOverallProgress() {
    const completed = this.playlist.filter(item => item.completed).length;
    const total = this.playlist.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (this.progressFill) {
      this.progressFill.style.width = `${percentage}%`;
    }
    if (this.progressText) {
      this.progressText.textContent = `${percentage}% Complete`;
    }
  }

  switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.lesson-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });
  }
}

// Initialize playlist when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on the neurology course page
  if (document.getElementById('playlistContainer')) {
    window.neurologyPlayer = new VideoPlaylist(neurologyPlaylist);
  }
});
