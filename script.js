class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = 'focus'; // 'focus', 'shortBreak', 'longBreak'
        this.sessionsCompleted = 0;
        this.currentCycle = 1;
        this.timer = null;
        this.totalTime = 25 * 60;

        // Settings
        this.settings = {
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15,
            soundEnabled: true
        };

        this.initializeElements();
        this.loadSettings();
        this.loadStats();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        this.timeDisplay = document.getElementById('timeDisplay');
        this.sessionType = document.getElementById('sessionType');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressFill = document.getElementById('progressFill');
        this.sessionsToday = document.getElementById('sessionsToday');
        this.currentCycleDisplay = document.getElementById('currentCycle');
        this.themeToggle = document.getElementById('themeToggle');
        this.timerDisplay = document.querySelector('.timer-display');

        // Settings elements
        this.focusTimeInput = document.getElementById('focusTime');
        this.shortBreakInput = document.getElementById('shortBreak');
        this.longBreakInput = document.getElementById('longBreak');
        this.soundEnabledInput = document.getElementById('soundEnabled');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Settings listeners
        this.focusTimeInput.addEventListener('change', () => this.updateSettings());
        this.shortBreakInput.addEventListener('change', () => this.updateSettings());
        this.longBreakInput.addEventListener('change', () => this.updateSettings());
        this.soundEnabledInput.addEventListener('change', () => this.updateSettings());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.isRunning ? this.pause() : this.start();
            }
            if (e.code === 'Escape') {
                this.reset();
            }
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startBtn.textContent = 'Running...';
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.timerDisplay.classList.add('active');
            
            this.timer = setInterval(() => {
                this.tick();
            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            clearInterval(this.timer);
            this.startBtn.textContent = 'Resume';
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.timerDisplay.classList.remove('active');
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timer);
        
        if (this.currentSession === 'focus') {
            this.timeLeft = this.settings.focusTime * 60;
            this.totalTime = this.settings.focusTime * 60;
        } else if (this.currentSession === 'shortBreak') {
            this.timeLeft = this.settings.shortBreak * 60;
            this.totalTime = this.settings.shortBreak * 60;
        } else {
            this.timeLeft = this.settings.longBreak * 60;
            this.totalTime = this.settings.longBreak * 60;
        }
        
        this.startBtn.textContent = 'Start';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.timerDisplay.classList.remove('active');
        this.updateDisplay();
    }

    tick() {
        this.timeLeft--;
        this.updateDisplay();

        if (this.timeLeft <= 0) {
            this.sessionComplete();
        }
    }

    sessionComplete() {
        this.isRunning = false;
        clearInterval(this.timer);
        this.timerDisplay.classList.remove('active');
        
        if (this.settings.soundEnabled) {
            this.playNotificationSound();
        }
        
        this.showNotification();
        
        if (this.currentSession === 'focus') {
            this.sessionsCompleted++;
            this.saveStats();
            
            // Determine next session type
            if (this.sessionsCompleted % 4 === 0) {
                this.switchToSession('longBreak');
                this.currentCycle++;
            } else {
                this.switchToSession('shortBreak');
            }
        } else {
            this.switchToSession('focus');
        }
        
        this.updateStats();
        this.startBtn.textContent = 'Start';
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
    }

    switchToSession(sessionType) {
        this.currentSession = sessionType;
        this.timerDisplay.classList.remove('break');
        
        if (sessionType === 'focus') {
            this.timeLeft = this.settings.focusTime * 60;
            this.totalTime = this.settings.focusTime * 60;
            this.sessionType.textContent = 'Focus Time';
        } else if (sessionType === 'shortBreak') {
            this.timeLeft = this.settings.shortBreak * 60;
            this.totalTime = this.settings.shortBreak * 60;
            this.sessionType.textContent = 'Short Break';
            this.timerDisplay.classList.add('break');
        } else {
            this.timeLeft = this.settings.longBreak * 60;
            this.totalTime = this.settings.longBreak * 60;
            this.sessionType.textContent = 'Long Break';
            this.timerDisplay.classList.add('break');
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update progress bar
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        this.progressFill.style.width = `${progress}%`;
        
        // Update page title
        document.title = `${this.timeDisplay.textContent} - 🍅 Pomodoro`;
    }

    updateStats() {
        this.sessionsToday.textContent = this.sessionsCompleted;
        this.currentCycleDisplay.textContent = this.currentCycle;
    }

    playNotificationSound() {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    showNotification() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                const message = this.currentSession === 'focus' 
                    ? 'Great work! Time for a break.' 
                    : 'Break time is over. Ready to focus?';
                
                new Notification('🍅 Pomodoro Timer', {
                    body: message,
                    icon: '🍅'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
    }

    updateSettings() {
        this.settings.focusTime = parseInt(this.focusTimeInput.value);
        this.settings.shortBreak = parseInt(this.shortBreakInput.value);
        this.settings.longBreak = parseInt(this.longBreakInput.value);
        this.settings.soundEnabled = this.soundEnabledInput.checked;
        
        this.saveSettings();
        
        // Update current timer if not running
        if (!this.isRunning && !this.isPaused) {
            this.reset();
        }
    }

    saveSettings() {
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        
        // Update input values
        this.focusTimeInput.value = this.settings.focusTime;
        this.shortBreakInput.value = this.settings.shortBreak;
        this.longBreakInput.value = this.settings.longBreak;
        this.soundEnabledInput.checked = this.settings.soundEnabled;
        
        // Set initial timer
        this.timeLeft = this.settings.focusTime * 60;
        this.totalTime = this.settings.focusTime * 60;
    }

    saveStats() {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{}');
        
        if (!stats[today]) {
            stats[today] = 0;
        }
        stats[today] = this.sessionsCompleted;
        
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }

    loadStats() {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('pomodoroStats') || '{}');
        
        this.sessionsCompleted = stats[today] || 0;
        this.currentCycle = Math.floor(this.sessionsCompleted / 4) + 1;
        this.updateStats();
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        localStorage.setItem('pomodoroTheme', newTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('pomodoroTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize the timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    timer.loadTheme();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}); 