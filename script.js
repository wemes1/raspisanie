// --- DATA ---
const BELLS = [
    { order: 1, start: "08:00", end: "08:40" },
    { order: 2, start: "08:45", end: "09:25" },
    { order: 3, start: "09:35", end: "10:15" },
    { order: 4, start: "10:25", end: "11:05" },
    { order: 5, start: "11:15", end: "11:55" },
    { order: 6, start: "12:00", end: "12:40" },
    { order: 7, start: "12:45", end: "13:25" },
    { order: 8, start: "13:35", end: "14:15" }
];

const LESSONS = {
    1: [
        { name: "Разговоры о важном", room: "—" },
        { name: "География", room: "304" },
        { name: "Труды (маст)", room: "Мастерская" },
        { name: "История", room: "104" },
        { name: "ОБЖ", room: "—" }
    ],
    2: [
        { name: "Русский язык", room: "308" },
        { name: "Английский язык", room: "105/107" },
        { name: "Химия", room: "211" },
        { name: "Физика", room: "209" },
        { name: "История", room: "104" },
        { name: "Геометрия", room: "205" },
        { name: "Алгебра", room: "205" }
    ],
    3: [
        { name: "География", room: "304" },
        { name: "Труды (маст)", room: "Мастерская" },
        { name: "Английский / Информ", room: "105/210" },
        { name: "Алгебра", room: "203" },
        { name: "Вероятность и стат", room: "203" }
        { name: "Русский язык", room: "308" },
        { name: "Литература", room: "308" }
        { name: "Физика", room: "209" },
    ],
    4: [
        { name: "Литература", room: "308" },
        { name: "Биология", room: "303" },
        { name: "Информ / Английский", room: "210/107" },
        { name: "ОБЖ", room: "—" }
        { name: "Геометрия", room: "205" },
        { name: "Английский язык", room: "105/107" },
        { name: "Физика", room: "209" },
        
    ],
    5: [
        { name: "Физика", room: "209" },
        { name: "Обществознание", room: "104" },
        { name: "Физкультура", room: "Спортзал" },
        { name: "Родная литература", room: "301/308" },
        { name: "Алгебра", room: "205" },
        { name: "Литература", room: "308" },
        { name: "Вероятность и стат", room: "205" }
    ]
};

const DAY_NAMES = ["Вск", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const FULL_DAY_NAMES = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

// --- STATE ---
let currentDay = new Date().getDay();
if (currentDay === 0 || currentDay === 6) currentDay = 1; // Default to Mon on weekends
let activeDayView = currentDay;
let grades = JSON.parse(localStorage.getItem('grades') || '[]');

// --- UTILS ---
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// --- RENDERERS ---
function updateHeader() {
    const now = new Date();
    const dateStr = `${FULL_DAY_NAMES[now.getDay()]}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const headerDate = document.getElementById('header-date');
    if (headerDate) headerDate.innerText = dateStr;
}

function renderCountdown() {
    const now = new Date();
    const currentDayReal = now.getDay();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const container = document.getElementById('countdown-content');

    if (!container) return;

    if (currentDayReal === 0 || currentDayReal === 6) {
        container.innerHTML = `<h2 class="lesson-name">Выходной!</h2><p style="color: var(--text-dim)">Отдыхай, уроков нет.</p>`;
        return;
    }

    const schedule = LESSONS[currentDayReal] || [];
    let status = null;

    for (let i = 0; i < BELLS.length; i++) {
        const bell = BELLS[i];
        const startMins = timeToMinutes(bell.start);
        const endMins = timeToMinutes(bell.end);

        if (currentMins >= startMins && currentMins < endMins) {
            const lesson = schedule[i];
            if (lesson) {
                const remainingSecs = (endMins * 60) - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
                status = { type: 'lesson', lesson, bell, remainingSecs, index: i };
                break;
            }
        }

        // Break check
        if (i < BELLS.length - 1) {
            const nextBell = BELLS[i + 1];
            const nextStartMins = timeToMinutes(nextBell.start);
            if (currentMins >= endMins && currentMins < nextStartMins) {
                const nextLesson = schedule[i + 1];
                if (nextLesson) {
                    const remainingSecs = (nextStartMins * 60) - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
                    status = { type: 'break', nextLesson, remainingSecs };
                    break;
                }
            }
        }
    }

    if (!status) {
        const firstStart = timeToMinutes(BELLS[0].start);
        const lastEnd = timeToMinutes(BELLS[BELLS.length - 1].end);
        if (currentMins < firstStart) {
            container.innerHTML = `<h2 class="lesson-name">Уроки скоро</h2><p style="color: var(--text-dim)">Готовься к первому занятию!</p>`;
        } else {
            container.innerHTML = `<h2 class="lesson-name">Свобода!</h2><p style="color: var(--text-dim)">Уроки на сегодня закончились.</p>`;
        }
        return;
    }

    if (status.type === 'lesson') {
        const nextLesson = schedule[status.index + 1];
        const nextInfo = nextLesson 
            ? `<div class="next-lesson-mini">
                 <span class="label">Далее:</span> 
                 <span class="value">${nextLesson.name} (каб. ${nextLesson.room})</span>
               </div>`
            : '';

        container.innerHTML = `
            <div class="status-badge status-lesson">
                <i data-lucide="timer" style="width:14px;height:14px"></i> Идет урок
            </div>
            <h2 class="lesson-name">${status.lesson.name}</h2>
            <div class="timer-row">
                <div class="timer-display-group">
                    <div class="timer-display">${formatTime(status.remainingSecs)}</div>
                    <div class="timer-label">Осталось времени</div>
                </div>
                <div class="timer-info">
                    <div class="label">Звонки</div>
                    <div class="value">${status.bell.start} — ${status.bell.end}</div>
                </div>
            </div>
            ${nextInfo}`;
    } else {
        container.innerHTML = `
            <div class="status-badge status-break">
                <i data-lucide="timer" style="width:14px;height:14px"></i> Перемена
            </div>
            <h2 class="lesson-name">Время отдохнуть!</h2>
            <div class="timer-row">
                <div class="timer-display-group">
                    <div class="timer-display">${formatTime(status.remainingSecs)}</div>
                    <div class="timer-label">До звонка</div>
                </div>
                <div class="timer-info">
                    <div class="label">Далее</div>
                    <div class="value">${status.nextLesson.name}</div>
                    <div class="label" style="margin-top:2px">каб. ${status.nextLesson.room}</div>
                </div>
            </div>`;
    }
    if (window.lucide) lucide.createIcons();
}

function renderDayButtons() {
    const container = document.getElementById('day-buttons');
    if (!container) return;
    container.innerHTML = '';
    [1, 2, 3, 4, 5].forEach(d => {
        const btn = document.createElement('button');
        btn.className = `day-btn ${activeDayView === d ? 'active' : ''}`;
        btn.innerText = DAY_NAMES[d];
        btn.onclick = () => { activeDayView = d; renderDayButtons(); renderLessons(); };
        container.appendChild(btn);
    });
}

function renderLessons() {
    const container = document.getElementById('lesson-list');
    if (!container) return;
    const now = new Date();
    const currentDayReal = now.getDay();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    const schedule = LESSONS[activeDayView] || [];
    container.innerHTML = '';

    schedule.forEach((lesson, i) => {
        const bell = BELLS[i];
        if (!bell) return;

        const startMins = timeToMinutes(bell.start);
        const endMins = timeToMinutes(bell.end);
        const isActive = (activeDayView === currentDayReal && currentMins >= startMins && currentMins < endMins);

        container.innerHTML += `
            <div class="lesson-item ${isActive ? 'active' : ''}">
                <div class="lesson-left">
                    <div class="lesson-order">${i + 1}</div>
                    <div class="lesson-info">
                        <h3>${lesson.name}</h3>
                        <div class="lesson-room">
                            <i data-lucide="map-pin" style="width:14px;height:14px"></i>
                            каб. ${lesson.room}
                        </div>
                    </div>
                </div>
                <div class="lesson-time">
                    <div class="time-start">${bell.start}</div>
                    <div class="time-end">${bell.end}</div>
                </div>
            </div>`;
    });
    if (window.lucide) lucide.createIcons();
}

function renderBells() {
    const container = document.getElementById('bells-list');
    if (!container) return;
    container.innerHTML = BELLS.map(bell => `
        <div class="bell-row">
            <div class="bell-left">
                <div class="bell-num">${bell.order}</div>
                <span style="font-weight: 600; opacity: 0.8;">Урок ${bell.order}</span>
            </div>
            <div class="bell-times">
                <div class="time-box">${bell.start}</div>
                <div style="width: 10px; height: 1px; background: rgba(255,255,255,0.1);"></div>
                <div class="time-box time-box-end">${bell.end}</div>
            </div>
        </div>
    `).join('');
}

function renderGrades() {
    const avgDisplay = document.getElementById('avg-grade-display');
    const countDisplay = document.getElementById('grades-count');
    const historyList = document.getElementById('grades-history');

    if (!avgDisplay || !countDisplay || !historyList) return;

    if (grades.length === 0) {
        avgDisplay.innerText = "0.00";
        countDisplay.innerText = "Оценок нет";
        historyList.innerHTML = `<div class="empty-state">Добавь первую оценку</div>`;
    } else {
        const sum = grades.reduce((a, b) => a + b, 0);
        const avg = sum / grades.length;
        avgDisplay.innerText = avg.toFixed(2);
        countDisplay.innerText = `Всего оценок: ${grades.length}`;
        
        historyList.innerHTML = grades.map((g, i) => `
            <div class="grade-pill btn-${g}" onclick="removeGrade(${i})">
                ${g}
            </div>
        `).reverse().join(''); // Show latest first
    }
}

// --- ACTIONS ---
window.addGrade = function(g) {
    grades.push(g);
    saveGrades();
    renderGrades();
};

window.removeGrade = function(i) {
    const originalIndex = grades.length - 1 - i; // because we reverse in render
    grades.splice(originalIndex, 1);
    saveGrades();
    renderGrades();
};

function saveGrades() {
    localStorage.setItem('grades', JSON.stringify(grades));
}

// --- NAVIGATION ---
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            const target = item.getAttribute('data-target');
            item.classList.add('active');
            const tab = document.getElementById(`tab-${target}`);
            if (tab) tab.classList.add('active');
            
            if (target === 'schedule') { renderLessons(); }
        };
    });
}

// --- INIT ---
function init() {
    if (window.lucide) lucide.createIcons();
    renderDayButtons();
    renderLessons();
    renderBells();
    renderGrades();
    setupNavigation();

    // Set up listeners
    const prevBtn = document.getElementById('day-prev');
    const nextBtn = document.getElementById('day-next');
    
    if (prevBtn) {
        prevBtn.onclick = () => {
            activeDayView = activeDayView === 1 ? 5 : activeDayView - 1;
            renderDayButtons();
            renderLessons();
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            activeDayView = activeDayView === 5 ? 1 : activeDayView + 1;
            renderDayButtons();
            renderLessons();
        };
    }
    
    // Start Timers
    setInterval(() => {
        updateHeader();
        renderCountdown();
        renderLessons();
    }, 1000);
    
    updateHeader();
    renderCountdown();
}

window.onload = init;
