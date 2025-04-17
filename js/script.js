let questions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let selectedCSV = ""; // 選択されたCSVファイル名

async function loadCSV(file) {
  const response = await fetch(`csv/${file}`);
  const text = await response.text();
  const lines = text.trim().split("\n");

  questions = lines.slice(1).map((line) => {
    const [question, a, b, c, d, answer] = line
      .split(",")
      .map((item) => item.trim());
    return { question, options: [a, b, c, d], answer };
  });

  showQuestion(); // currentQuestionIndex に従って表示
}

function startQuiz(resetProgress = true) {
  if (resetProgress) {
    currentQuestionIndex = 0;
    correctCount = 0;
    localStorage.removeItem("quizProgress");
  }

  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  loadCSV(selectedCSV); // 選択したCSVをロード
}

function showQuestion() {
  const q = questions[currentQuestionIndex];
  document.getElementById("question-number").textContent = `問題 ${
    currentQuestionIndex + 1
  } / ${questions.length}`;
  document.getElementById("question").textContent = q.question;
  document.getElementById("result").textContent = "";
  document.getElementById("options").innerHTML = "";

  const nextBtn = document.getElementById("next");
  nextBtn.style.display = "block";
  nextBtn.disabled = true;

  const labels = ["A", "B", "C", "D"];
  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.textContent = `${labels[index]}: ${option}`;
    btn.className = "option";
    btn.dataset.answer = labels[index];
    btn.onclick = () => checkAnswer(labels[index], nextBtn);
    document.getElementById("options").appendChild(btn);
  });
}

function checkAnswer(selected, nextBtn) {
  const q = questions[currentQuestionIndex];
  const correctAnswer = q.answer;
  const buttons = document.querySelectorAll(".option");

  buttons.forEach((btn) => {
    btn.onclick = null;
    if (btn.dataset.answer === correctAnswer) {
      btn.classList.add("correct");
    }
  });

  if (selected === correctAnswer) {
    document.getElementById("result").textContent = "正解です 🎉";
    correctCount++;
  } else {
    document.getElementById(
      "result"
    ).textContent = `不正解です ❌ 正解は ${correctAnswer} です`;
  }

  nextBtn.disabled = false;
}

document.getElementById("next").addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    document.getElementById(
      "quiz-container"
    ).innerHTML = `<h2>テスト終了</h2><p>結果: ${questions.length} 問中 ${correctCount} 問正解</p>`;
  }
});

document.getElementById("start").addEventListener("click", () => {
  selectedCSV = document.getElementById("csv-selector").value;
  if (!selectedCSV) {
    alert("CSVファイルを選択してください。");
    return;
  }
  startQuiz(true);
});

function populateCSVSelector() {
  const selector = document.getElementById("csv-selector");
  const csvFiles = [
    //"questions1.csv",
    //"questions2.csv",
    //"questions3.csv",
    //"questions4.csv",
    "zaitaku_section2.csv",
  ];

  csvFiles.forEach((file) => {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = file;
    selector.appendChild(option);
  });

  // 保存された選択状態があれば復元
  const savedProgress = localStorage.getItem("quizProgress");
  if (savedProgress) {
    const { selectedCSV: savedCSV } = JSON.parse(savedProgress);
    selector.value = savedCSV;
  }
}

document.addEventListener("DOMContentLoaded", populateCSVSelector);

document.getElementById("pause").addEventListener("click", () => {
  const progress = {
    selectedCSV,
    currentQuestionIndex,
    correctCount,
  };
  localStorage.setItem("quizProgress", JSON.stringify(progress));

  alert("進捗を保存しました。トップページに戻ります。");

  // クイズ画面を非表示にしてメニュー画面を表示
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("menu").style.display = "block";
});

document.getElementById("resume").addEventListener("click", () => {
  const savedProgress = localStorage.getItem("quizProgress");
  if (!savedProgress) {
    alert("再開できる進捗データがありません。");
    return;
  }

  const {
    selectedCSV: savedCSV,
    currentQuestionIndex: savedIndex,
    correctCount: savedCorrect,
  } = JSON.parse(savedProgress);

  selectedCSV = savedCSV;
  currentQuestionIndex = savedIndex;
  correctCount = savedCorrect;

  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";

  loadCSV(selectedCSV); // → 読み込んでから showQuestion() を呼ぶ
});
