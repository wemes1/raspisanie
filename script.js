// Schedule configuration
const schedule = {
    0: [ // Понедельник
        { time: "08:00", endTime: "08:40", name: "Разговоры о важном", room: "—" },
        { time: "08:45", endTime: "09:25", name: "География", room: "304" },
        { time: "09:35", endTime: "10:15", name: "Труды (маст)", room: "Мастерская" },
        { time: "10:25", endTime: "11:05", name: "История", room: "104" },
        { time: "11:15", endTime: "11:55", name: "ОБЖ", room: "—" }
    ],
    1: [ // Вторник
        { time: "08:00", endTime: "08:40", name: "Русский язык", room: "308" },
        { time: "08:45", endTime: "09:25", name: "Английский язык", room: "105/107" },
        { time: "09:35", endTime: "10:15", name: "Химия", room: "211" },
        { time: "10:25", endTime: "11:05", name: "Физика", room: "209" },
        { time: "11:15", endTime: "11:55", name: "История", room: "104" },
        { time: "12:00", endTime: "12:40", name: "Геометрия", room: "205" },
        { time: "12:45", endTime: "13:25", name: "Алгебра", room: "205" }
    ],
    2: [ // Среда
        { time: "08:00", endTime: "08:40", name: "Физкультура", room: "Спортзал" },
        { time: "08:45", endTime: "09:25", name: "География", room: "304" },
        { time: "09:35", endTime: "10:15", name: "Башкирский язык", room: "102/103" },
        { time: "10:25", endTime: "11:05", name: "Английский / Информ", room: "105/210" },
        { time: "11:15", endTime: "11:55", name: "Алгебра", room: "205" },
        { time: "12:00", endTime: "12:40", name: "Биология", room: "303" },
        { time: "12:45", endTime: "13:25", name: "Русский язык", room: "308" },
        { time: "13:35", endTime: "14:15", name: "Литература", room: "308" }
    ],
    3: [ // Четверг
        { time: "08:00", endTime: "08:40", name: "Химия", room: "211" },
        { time: "08:45", endTime: "09:25", name: "Геометрия", room: "205" },
        { time: "09:35", endTime: "10:15", name: "Родной язык", room: "301/308" },
        { time: "10:25", endTime: "11:05", name: "Биология", room: "303" },
        { time: "11:15", endTime: "11:55", name: "Русский язык", room: "308" },
        { time: "12:00", endTime: "12:40", name: "Английский язык", room: "105/107" },
        { time: "12:45", endTime: "13:25", name: "Россия — мои горизонты", room: "—" }
    ],
    4: [ // Пятница
        { time: "08:00", endTime: "08:40", name: "Физика", room: "209" },
        { time: "08:45", endTime: "09:25", name: "Информ / Английский", room: "210/107" },
        { time: "09:35", endTime: "10:15", name: "Обществознание", room: "104" },
        { time: "10:25", endTime: "11:05", name: "Физкультура", room: "Спортзал" },
        { time: "11:15", endTime: "11:55", name: "Родная литература", room: "301/308" },
        { time: "12:00", endTime: "12:40", name: "Алгебра", room: "205" },
        { time: "12:45", endTime: "13:25", name: "Литература", room: "308" },
        { time: "13:35", endTime: "14:15", name: "Вероятность и стат", room: "205" }
    ],
    5: [] // Суббота
};

const dayNames = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
let currentDay = new Date().getDay() - 1;
if (currentDay < 0 || currentDay > 5) currentDay = 0;

// Track the currently selected day in the UI
let selectedDay = currentDay;

document.addEventListener('DOMContentLoaded', () => {
    selectDay(selectedDay);
    updateTimer();
    setInterval(updateTimer, 1000);
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        selectDay(parseInt(btn.dataset.day));
    });
});

function selectDay(day) {
    selectedDay = day;
    document.querySelectorAll('.day-btn').forEach(btn => {
        const btnDay = parseInt(btn.dataset.day);
        btn.classList.toggle('active', btnDay === day);
        const today = new Date().getDay() - 1;
        if (btnDay === today && btnDay !== day) {
            btn.classList.add('border', 'border-white/50');
        } else {
            btn.classList.remove('border', 'border-white/50');
        }
    });
    renderSchedule(day);
}

function renderSchedule(day) {
    const container = document.getElementById('scheduleList');
    const title = document.getElementById('scheduleTitle');
    title.textContent = dayNames[day];
    
    const lessons = schedule[day] || [];
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const realToday = now.getDay() - 1;
    
    if (lessons.length === 0) {
        container.innerHTML = '<div class="text-center text-white/50 py-8">В этот день уроков нет 🙌</div>';
        return;
    }
    
    container.innerHTML = lessons.map((lesson, index) => {
        const [startH, startM] = lesson.time.split(':').map(Number);
        const [endH, endM] = lesson.endTime.split(':').map(Number);
        const startTime = startH * 60 + startM;
        const endTime = endH * 60 + endM;
        
        let isCurrent = false;
        let statusBadge = '';
        
        if (realToday === day) {
            if (currentTime >= startTime && currentTime < endTime) {
                isCurrent = true;
                statusBadge = '<span class="text-xs bg-green-400/20 text-green-300 px-2 py-0.5 rounded-full ml-2">Идёт урок</span>';
            }
        }
        
        return `
            <div class="lesson-card glass-dark rounded-xl p-3 md:p-4 flex items-center gap-4 ${isCurrent ? 'current' : ''}">
                <div class="text-center min-w-[60px]">
                    <div class="text-white font-bold text-base md:text-lg leading-none mb-1">${lesson.time}</div>
                    <div class="text-white/50 text-xs">${lesson.endTime}</div>
                </div>
                <div class="h-10 w-px bg-white/10"></div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center flex-wrap gap-1">
                        <span class="text-white font-semibold text-base md:text-lg truncate">${lesson.name}</span>
                        ${statusBadge}
                    </div>
                    <div class="flex items-center gap-2 text-white/60 text-sm mt-0.5">
                        <span>🚪 Каб. ${lesson.room}</span>
                    </div>
                </div>
                <div class="text-2xl opacity-60 hidden md:block">
                    ${getSubjectEmoji(lesson.name)}
                </div>
            </div>
        `;
    }).join('');
}

function getSubjectEmoji(name) {
    const lower = name.toLowerCase();
    if(lower.includes('разговор')) return '🇷🇺';
    if(lower.includes('россия')) return '🌅';
    if(lower.includes('труд') || lower.includes('технолог') || lower.includes('маст')) return '🔨';
    if(lower.includes('обж')) return '⛑️';
    if(lower.includes('башкир')) return '🗣️';
    if(lower.includes('вероятност') || lower.includes('стат')) return '🎲';
    if(lower.includes('родной')) return '🏡';
    
    if(lower.includes('мат') || lower.includes('алгеб') || lower.includes('геомет')) return '📐';
    if(lower.includes('рус') || lower.includes('лит')) return '📚';
    if(lower.includes('ист') || lower.includes('общ')) return '🏛️';
    if(lower.includes('физ') && !lower.includes('культ')) return '⚡';
    if(lower.includes('хим')) return '🧪';
    if(lower.includes('био')) return '🧬';
    if(lower.includes('геог')) return '🌍';
    if(lower.includes('англ')) return '🇬🇧';
    if(lower.includes('физк') || lower.includes('спорт')) return '⚽';
    if(lower.includes('инф') || lower.includes('комп')) return '💻';
    if(lower.includes('изо') || lower.includes('иск')) return '🎨';
    if(lower.includes('муз')) return '🎵';
    return '📝';
}

function updateTimer() {
    const now = new Date();
    const today = now.getDay() - 1; // 0=Mon, 5=Sat
    const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    
    const elTimerH = document.getElementById('timerHours');
    const elTimerM = document.getElementById('timerMinutes');
    const elTimerS = document.getElementById('timerSeconds');
    const elState = document.getElementById('timerState');
    
    const elCurName = document.getElementById('currentLessonName');
    const elCurRoom = document.getElementById('currentLessonRoom');
    const elProgress = document.getElementById('progressBar');
    const elPercent = document.getElementById('progressPercent');
    
    const elNextName = document.getElementById('nextLessonName');
    const elNextRoom = document.getElementById('nextLessonRoom');
    const elNextTime = document.getElementById('nextLessonTime');

    const resetState = (msg) => {
        elTimerH.textContent = "00";
        elTimerM.textContent = "00";
        elTimerS.textContent = "00";
        elState.textContent = msg;
        elCurName.textContent = "Отдых";
        elCurRoom.textContent = "--";
        elProgress.style.width = "0%";
        elPercent.textContent = "";
        
        elNextName.textContent = "Нет уроков";
        elNextRoom.textContent = "--";
        elNextTime.textContent = "--:--";
    };

    const daySchedule = schedule[today];
    
    if (today < 0 || today > 5 || !daySchedule) {
        resetState(today === 6 ? "Воскресенье" : "Не учебное время");
        
        if (today === 6) {
            const nextDay = schedule[0];
            if (nextDay && nextDay.length > 0) {
                 elNextName.textContent = nextDay[0].name;
                 elNextRoom.textContent = "Завтра " + nextDay[0].room;
                 elNextTime.textContent = nextDay[0].time;
            }
        }
        return;
    }

    let currentLesson = null;
    let nextLesson = null;
    let state = 'free'; // free, lesson, break
    let targetTime = 0; // in seconds
    let startTime = 0;  // in seconds (for progress)

    for (let i = 0; i < daySchedule.length; i++) {
        const lesson = daySchedule[i];
        const [startH, startM] = lesson.time.split(':').map(Number);
        const [endH, endM] = lesson.endTime.split(':').map(Number);
        
        const sTime = startH * 3600 + startM * 60;
        const eTime = endH * 3600 + endM * 60;

        if (currentTime >= sTime && currentTime < eTime) {
            state = 'lesson';
            currentLesson = lesson;
            nextLesson = daySchedule[i + 1] || null;
            targetTime = eTime;
            startTime = sTime;
            break;
        } else if (currentTime < sTime) {
            state = i === 0 ? 'morning' : 'break';
            nextLesson = lesson;
            
            targetTime = sTime;
            
            if (i > 0) {
                 const prevLesson = daySchedule[i - 1];
                 const [peH, peM] = prevLesson.endTime.split(':').map(Number);
                 startTime = peH * 3600 + peM * 60;
            } else {
                 startTime = sTime - 3600; 
            }
            break;
        }
    }

    if (state === 'free') {
        resetState("Уроки закончились");
        
        const nextDayIdx = (today + 1) % 7;
        const nextDaySch = schedule[nextDayIdx];
        if (nextDaySch && nextDaySch.length > 0) {
             elNextName.textContent = nextDaySch[0].name;
             elNextRoom.textContent = (nextDayIdx === 0 ? "Понедельник" : "Завтра") + " " + nextDaySch[0].room;
             elNextTime.textContent = nextDaySch[0].time;
        }
        return;
    }

    let diff = targetTime - currentTime;
    if (diff < 0) diff = 0;
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    
    elTimerH.textContent = h.toString().padStart(2, '0');
    elTimerM.textContent = m.toString().padStart(2, '0');
    elTimerS.textContent = s.toString().padStart(2, '0');

    const totalDuration = targetTime - startTime;
    const elapsed = currentTime - startTime;
    let progress = (elapsed / totalDuration) * 100;
    progress = Math.max(0, Math.min(100, progress));
    
    elProgress.style.width = `${progress}%`;
    elPercent.textContent = `${Math.round(progress)}%`;

    if (state === 'lesson') {
        elState.textContent = "До конца урока";
        elState.classList.remove('text-green-300', 'text-yellow-300');
        elState.classList.add('text-blue-300');
        
        elCurName.textContent = currentLesson.name;
        elCurRoom.textContent = `Кабинет ${currentLesson.room}`;
    } else {
        elState.textContent = state === 'morning' ? "До начала уроков" : "Перемена";
        elState.classList.remove('text-blue-300');
        elState.classList.add('text-green-300');
        
        elCurName.textContent = "Перемена";
        elCurRoom.textContent = "Отдых";
    }

    if (nextLesson) {
        elNextName.textContent = nextLesson.name;
        elNextRoom.textContent = `Каб. ${nextLesson.room}`;
        elNextTime.textContent = nextLesson.time;
    } else {
        elNextName.textContent = "Домой!";
        elNextRoom.textContent = "--";
        elNextTime.textContent = "--:--";
    }
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    };
    const str = now.toLocaleDateString('ru-RU', options);
    document.getElementById('currentDateTime').textContent = str.charAt(0).toUpperCase() + str.slice(1);
}