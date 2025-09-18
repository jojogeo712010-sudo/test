// عناصر تسجيل الدخول
const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const showRegisterBtn = document.getElementById("showRegisterBtn");

const registerScreen = document.getElementById("registerScreen");
const registerForm = document.getElementById("registerForm");
const registerUsername = document.getElementById("registerUsername");
const registerPassword = document.getElementById("registerPassword");
const registerError = document.getElementById("registerError");
const showLoginBtn = document.getElementById("showLoginBtn");

// شاشة البداية وأزرارها
const startScreen = document.getElementById("startScreen");
const playBtn = document.getElementById("playBtn");
const welcomePlayer = document.getElementById("welcomePlayer");
const logoutBtn = document.getElementById("logoutBtn");
const settingsBtn = document.getElementById("settingsBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const playerRankBox = document.getElementById("playerRankBox");

// نافذة الإعدادات
const settingsModal = document.getElementById("settingsModal");
const muteSoundsCheckbox = document.getElementById("muteSounds");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");

// نافذة المتصدرين
const leaderboardModal = document.getElementById("leaderboardModal");
const leaderboardTable = document.getElementById("leaderboardTable").getElementsByTagName("tbody")[0];
const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");

const gameCard = document.getElementById("gameCard");
const questionText = document.getElementById("questionText");
const options = document.querySelectorAll(".option");
const timerEl = document.getElementById("timer");
const restartBtn = document.getElementById("restartBtn");
const gameMsg = document.getElementById("gameMsg");
const scoreBox = document.getElementById("score");

const bgMusic = document.getElementById("bgMusic");
const groogCorrect = document.getElementById("groogCorrect");
const groogWrong = document.getElementById("groogWrong");

let currentUser = null;
let currentQuestion = 0;
let timeLeft = 30;
let timer;
let score = 0;
let shuffledQuestions = [];
let currentAnswers = [];
let correctIndex = 0;
let soundTimeout = null;
let muted = false;

const prizes = [500, 1000, 2000, 5000, 10000];

const questions = [
  {
    question: "ما هي عاصمة فرنسا؟",
    answers: ["برلين", "مدريد", "باريس", "روما"],
    correct: 2
  },
  {
    question: "ما هو أكبر كوكب في المجموعة الشمسية؟",
    answers: ["الأرض", "زحل", "المشتري", "المريخ"],
    correct: 2
  },
  {
    question: "ما هو الحيوان الذي يُسمى بسفينة الصحراء؟",
    answers: ["الجمل", "الحصان", "الأسد", "الفيل"],
    correct: 0
  },
  {
    question: "كم عدد ألوان قوس قزح؟",
    answers: ["5", "6", "7", "8"],
    correct: 2
  },
  {
    question: "من هو مؤسس شركة مايكروسوفت؟",
    answers: ["ستيف جوبز", "بيل غيتس", "مارك زوكربيرج", "إيلون ماسك"],
    correct: 1
  }
];

// حفظ المستخدم في الجلسة (localStorage)
function setSessionUser(username) {
  localStorage.setItem("sessionUser", username);
}
function getSessionUser() {
  return localStorage.getItem("sessionUser");
}
function clearSessionUser() {
  localStorage.removeItem("sessionUser");
}

// إدارة المستخدمين في localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}
function saveUser(username, password) {
  let users = getUsers();
  users[username] = password;
  localStorage.setItem("users", JSON.stringify(users));
}
function userExists(username) {
  let users = getUsers();
  return users.hasOwnProperty(username);
}
function checkLogin(username, password) {
  let users = getUsers();
  return users[username] && users[username] === password;
}

// إدارة النقاط والمتصدرين:
function getScores() {
  return JSON.parse(localStorage.getItem("scores") || "{}");
}
function saveScore(username, score) {
  let scores = getScores();
  // فقط سجل أعلى رصيد وصل له اللاعب
  if (!scores[username] || score > scores[username]) {
    scores[username] = score;
    localStorage.setItem("scores", JSON.stringify(scores));
  }
}
function getLeaderboard() {
  let scores = getScores();
  let arr = Object.entries(scores).map(([u, s]) => ({username: u, score: s}));
  arr.sort((a, b) => b.score - a.score);
  return arr;
}
function getPlayerRank(username) {
  let leaderboard = getLeaderboard();
  let idx = leaderboard.findIndex(x => x.username === username);
  if (idx === -1) return null;
  return { rank: idx+1, score: leaderboard[idx].score, total: leaderboard.length };
}

// إعدادات الصوت
function setMute(val) {
  muted = val;
  bgMusic.muted = muted;
  groogCorrect.muted = muted;
  groogWrong.muted = muted;
  localStorage.setItem("mutedSounds", muted ? "1" : "0");
  muteSoundsCheckbox.checked = muted;
}
function getMute() {
  return localStorage.getItem("mutedSounds") === "1";
}

// إظهار شاشة التسجيل
showRegisterBtn.onclick = () => {
  loginScreen.style.display = "none";
  registerScreen.style.display = "block";
  registerError.textContent = "";
  registerUsername.value = "";
  registerPassword.value = "";
};
// إظهار شاشة تسجيل الدخول
showLoginBtn.onclick = () => {
  registerScreen.style.display = "none";
  loginScreen.style.display = "block";
  loginError.textContent = "";
  loginUsername.value = "";
  loginPassword.value = "";
};

// تسجيل حساب جديد
registerForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const username = registerUsername.value.trim();
  const password = registerPassword.value;
  if (username.length < 3) {
    registerError.textContent = "اسم المستخدم يجب أن يكون على الأقل 3 أحرف.";
    return;
  }
  if (password.length < 3) {
    registerError.textContent = "كلمة المرور يجب أن تكون على الأقل 3 أحرف.";
    return;
  }
  if (userExists(username)) {
    registerError.textContent = "اسم المستخدم موجود بالفعل!";
    return;
  }
  saveUser(username, password);
  registerError.textContent = "تم التسجيل بنجاح! يمكنك تسجيل الدخول الآن.";
  setTimeout(() => {
    registerScreen.style.display = "none";
    loginScreen.style.display = "block";
  }, 1000);
});

// تسجيل الدخول
loginForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  if (!userExists(username)) {
    loginError.textContent = "اسم المستخدم غير موجود!";
    return;
  }
  if (!checkLogin(username, password)) {
    loginError.textContent = "كلمة المرور غير صحيحة!";
    return;
  }
  loginError.textContent = "";
  currentUser = username;
  setSessionUser(currentUser);
  showStartScreen();
});

// زر تسجيل خروج
logoutBtn.onclick = function() {
  clearSessionUser();
  currentUser = null;
  startScreen.style.display = "none";
  gameCard.style.display = "none";
  loginScreen.style.display = "block";
  welcomePlayer.textContent = "";
  stopAllSounds();
  bgMusic.pause();
};

// زر الإعدادات
settingsBtn.onclick = function() {
  settingsModal.style.display = "flex";
  muteSoundsCheckbox.checked = muted;
};
closeSettingsBtn.onclick = function () {
  settingsModal.style.display = "none";
};
// كتم/تشغيل الأصوات
muteSoundsCheckbox.onchange = function() {
  setMute(muteSoundsCheckbox.checked);
};

// نافذة المتصدرين
leaderboardBtn.onclick = function() {
  fillLeaderboard();
  leaderboardModal.style.display = "flex";
};
closeLeaderboardBtn.onclick = function() {
  leaderboardModal.style.display = "none";
};
// تعبئة جدول المتصدرين
function fillLeaderboard() {
  let leaderboard = getLeaderboard();
  leaderboardTable.innerHTML = "";
  leaderboard.forEach((item, idx) => {
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${idx+1}</td><td>${item.username}</td><td>${item.score}</td>`;
    leaderboardTable.appendChild(tr);
  });
}

// عند تحميل الصفحة: تحقق من الجلسة و الإعدادات
window.onload = function() {
  muted = getMute();
  setMute(muted);
  let sessionUser = getSessionUser();
  if (sessionUser && userExists(sessionUser)) {
    currentUser = sessionUser;
    showStartScreen();
  } else {
    loginScreen.style.display = "block";
  }
};

// إظهار شاشة البداية مع اسم المستخدم وترتيبه
function showStartScreen() {
  loginScreen.style.display = "none";
  registerScreen.style.display = "none";
  startScreen.style.display = "block";
  gameCard.style.display = "none";
  welcomePlayer.textContent = `مرحبًا ${currentUser}!`;
  showPlayerRank();
}

// إظهار ترتيب اللاعب الحالي
function showPlayerRank() {
  let rank = getPlayerRank(currentUser);
  if (rank) {
    playerRankBox.textContent = `ترتيبك: ${rank.rank} من ${rank.total} لاعب - أعلى رصيد: ${rank.score} جنيه`;
  } else {
    playerRankBox.textContent = "لم تسجل أي رصيد بعد!";
  }
}

// بدء اللعبة
playBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameCard.style.display = "block";
  currentQuestion = 0;
  score = 0;
  scoreBox.textContent = score;
  shuffledQuestions = shuffleArray(questions);
  playBgMusic();
  loadQuestion();
});

function playBgMusic() {
  bgMusic.currentTime = 0;
  bgMusic.volume = 0.3;
  if (!muted) bgMusic.play().catch(()=>{});
  else bgMusic.pause();
}

function stopAllSounds() {
  groogCorrect.pause();
  groogCorrect.currentTime = 0;
  groogWrong.pause();
  groogWrong.currentTime = 0;
  if (soundTimeout) {
    clearTimeout(soundTimeout);
    soundTimeout = null;
  }
}

function shuffleArray(arr) {
  let a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadQuestion() {
  stopAllSounds();
  resetState();
  let q = shuffledQuestions[currentQuestion];
  let answersWithIndex = q.answers.map((ans, idx) => ({ans, idx}));
  let shuffledAnswers = shuffleArray(answersWithIndex);
  currentAnswers = shuffledAnswers.map(obj => obj.ans);
  correctIndex = shuffledAnswers.findIndex(obj => obj.idx === q.correct);
  questionText.textContent = q.question;
  options.forEach((btn, i) => {
    btn.textContent = currentAnswers[i];
    btn.style.display = "inline-block";
    btn.className = "option";
    btn.onclick = () => selectAnswer(i);
    btn.disabled = false;
  });
  startTimer();
}

function resetState() {
  options.forEach(btn => {
    btn.className = "option";
    btn.disabled = false;
    btn.style.display = "inline-block";
  });
  restartBtn.style.display = "none";
  gameMsg.textContent = "";
  timeLeft = 30;
  timerEl.textContent = timeLeft;
  timerEl.style.display = "flex";
  clearInterval(timer);
}

function selectAnswer(i) {
  clearInterval(timer);
  options.forEach(b => b.disabled = true);

  let correct = (i === correctIndex);
  let sound = correct ? groogCorrect : groogWrong;
  sound.muted = muted;
  sound.currentTime = 0;
  sound.play().catch(()=>{});

  if (correct) {
    options[i].classList.add("correct");
    score = prizes[currentQuestion] || score;
    scoreBox.textContent = score;
    gameMsg.textContent = `إجابة صحيحة 🎉 أحسنت يا ${currentUser}!`;
  } else {
    options[i].classList.add("wrong");
    options[correctIndex].classList.add("correct");
    gameMsg.textContent = `إجابة خاطئة ❌ حاول مرة أخرى يا ${currentUser}!`;
  }

  let delay = (sound.duration && sound.duration > 0) ? sound.duration * 1000 : 1200;
  if (!sound.duration || isNaN(sound.duration)) delay = 1200;

  soundTimeout = setTimeout(() => {
    soundTimeout = null;
    if (correct && currentQuestion < shuffledQuestions.length - 1) {
      currentQuestion++;
      loadQuestion();
    } else if (correct && currentQuestion >= shuffledQuestions.length - 1) {
      showEndGame("الفوز");
    } else {
      showEndGame("الخسارة");
    }
  }, delay);
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      options.forEach(b => b.disabled = true);
      options[correctIndex].classList.add("correct");
      groogWrong.muted = muted;
      groogWrong.currentTime = 0;
      groogWrong.play().catch(()=>{});
      let delay = (groogWrong.duration && groogWrong.duration > 0) ? groogWrong.duration * 1000 : 1200;
      if (!groogWrong.duration || isNaN(groogWrong.duration)) delay = 1200;
      soundTimeout = setTimeout(() => {
        soundTimeout = null;
        gameMsg.textContent = `انتهى الوقت ⏰ لقد خسرت يا ${currentUser}!`;
        showEndGame("الخسارة");
      }, delay);
    }
  }, 1000);
}

restartBtn.addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  scoreBox.textContent = score;
  shuffledQuestions = shuffleArray(questions);
  loadQuestion();
  restartBtn.style.display = "none";
  gameMsg.textContent = "";
  playBgMusic();
});

function showEndGame(type) {
  restartBtn.style.display = "inline-block";
  options.forEach(b => b.disabled = true);
  timerEl.style.display = "none";
  // حفظ أعلى رصيد
  saveScore(currentUser, score);
  showPlayerRank();
  if (type === "الفوز") {
    gameMsg.textContent = `مبروك يا ${currentUser}! ربحت ${score} جنيه 🏆`;
  } else if (type === "الخسارة") {
    gameMsg.textContent += `\nحظاً أوفر يا ${currentUser}! رصيدك النهائي: ${score} جنيه 💔`;
  } else {
    gameMsg.textContent = `انتهت اللعبة! رصيدك النهائي: ${score} جنيه 🎊`;
  }
  questionText.textContent = "";
  options.forEach(b => {
    b.textContent = "";
    b.style.display = "none";
  });
  bgMusic.pause();
  stopAllSounds();
}
