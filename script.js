let words = wordList.map(w => ({ ...w, star: false }));
let currentIndex = 0;
let activeWords = words;
let viewingStars = false;

function saveStars() {
    const starred = words
        .filter(w => w.star)
        .map(w => w.eng);
    localStorage.setItem('starredWords', JSON.stringify(starred));
}

function loadStars() {
    const saved = localStorage.getItem('starredWords');
    if (!saved) return;
    const starredEngs = JSON.parse(saved);
    words.forEach(w => {
        if (starredEngs.includes(w.eng)) w.star = true;
    });
}

function buildRangeSelector() {
    const selector = document.getElementById('range-selector');
    const total = words.length;
    const size = 100;

    const allOpt = document.createElement('option');
    allOpt.value = '0,' + total;
    allOpt.textContent = '전체 (2000개)';
    selector.appendChild(allOpt);

    for (let i = 0; i < total; i += size) {
        const end = Math.min(i + size, total);
        const opt = document.createElement('option');
        opt.value = `${i},${end}`;
        opt.textContent = `${i + 1}~${end}번 단어`;
        selector.appendChild(opt);
    }

    selector.addEventListener('change', () => {
        if (viewingStars) toggleStarView();
        const [s, e] = selector.value.split(',').map(Number);
        activeWords = words.slice(s, e);
        nextWord();
    });
}

function countCommonChars(a, b) {
    const freq = {};
    let count = 0;
    for (const ch of a) freq[ch] = (freq[ch] || 0) + 1;
    for (const ch of b) {
        if (freq[ch] > 0) { count++; freq[ch]--; }
    }
    return count;
}

function nextWord() {
    if (activeWords.length === 0) {
        document.getElementById('word-display').innerText = '없음';
        document.getElementById('result-text').innerHTML = viewingStars
            ? '별표한 단어가 없습니다.' : '';
        document.getElementById('answer-input').disabled = true;
        return;
    }
    currentIndex = Math.floor(Math.random() * activeWords.length);
    const word = activeWords[currentIndex];
    document.getElementById('word-display').innerText = word.eng;
    document.getElementById('answer-input').value = '';
    document.getElementById('result-text').innerText = '';
    document.getElementById('answer-input').disabled = false;
    document.getElementById('answer-input').focus();
    updateStarUI();
}

function checkAnswer() {
    const userInput = document.getElementById('answer-input').value.trim();
    const correct = activeWords[currentIndex].kor;
    const resultText = document.getElementById('result-text');
    const isCorrect = countCommonChars(userInput, correct) >= 2;

    if (isCorrect) {
        resultText.innerHTML = `정답! ✨<br><span class="answer-reveal">정답: ${correct}</span>`;
        resultText.style.color = '#2ecc71';
    } else {
        resultText.innerHTML = `오답 ✗<br><span class="answer-reveal">정답: ${correct}</span>`;
        resultText.style.color = '#e74c3c';
    }
    document.getElementById('answer-input').disabled = true;
}

function toggleStar() {
    if (activeWords.length === 0) return;
    activeWords[currentIndex].star = !activeWords[currentIndex].star;
    saveStars();

    if (viewingStars && !activeWords[currentIndex].star) {
        activeWords.splice(currentIndex, 1);
        updateStarCount();
        nextWord();
        return;
    }
    updateStarCount();
    updateStarUI();
}

function updateStarUI() {
    const starBtn = document.getElementById('star-btn');
    if (activeWords[currentIndex] && activeWords[currentIndex].star) {
        starBtn.classList.add('active');
        starBtn.innerText = '★';
    } else {
        starBtn.classList.remove('active');
        starBtn.innerText = '☆';
    }
}

function updateStarCount() {
    const count = words.filter(w => w.star).length;
    const btn = document.getElementById('star-view-btn');
    btn.textContent = `★ 모아보기 (${count})`;
}

function toggleStarView() {
    const selector = document.getElementById('range-selector');
    viewingStars = !viewingStars;

    if (viewingStars) {
        const starred = words.filter(w => w.star);
        activeWords = starred;
        selector.disabled = true;
        document.getElementById('star-view-btn').classList.add('active');
    } else {
        const [s, e] = selector.value.split(',').map(Number);
        activeWords = words.slice(s, e);
        selector.disabled = false;
        document.getElementById('star-view-btn').classList.remove('active');
    }
    nextWord();
}

document.getElementById('answer-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (document.getElementById('answer-input').disabled) {
            nextWord();
        } else {
            checkAnswer();
        }
    }
});

loadStars();
buildRangeSelector();
updateStarCount();
nextWord();