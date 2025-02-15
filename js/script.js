let questions = [];
let currentQuestionIndex = 0;
let correctCount = 0;

async function loadCSV() {
  const response = await fetch("csv/questions.csv"); // パスを変更
  const text = await response.text();
  const lines = text.trim().split("\n");

  // 1行目（ヘッダー）をスキップ
  questions = lines.slice(1).map((line) => {
    const [question, a, b, c, d, answer] = line
      .split(",")
      .map((item) => item.trim()); // 空白を削除
    return { question, options: [a, b, c, d], answer };
  });

  console.log(questions); // CSVデータの確認用
  showQuestion();
}

function startQuiz(resetProgress = true) {
  if (resetProgress) {
    currentQuestionIndex = 0;
    correctCount = 0;
    localStorage.removeItem("quizProgress"); // 進捗リセット
  }

  document.getElementById("menu").style.display = "none";
  document.getElementById("quiz-container").style.display = "block";
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestionIndex];
  document.getElementById("question-number").textContent = `問題 ${
    currentQuestionIndex + 1
  } / ${questions.length}`;
  document.getElementById("question").textContent = q.question;
  document.getElementById("result").textContent = "";
  document.getElementById("options").innerHTML = "";

  // 「次へ」ボタンは表示しつつ、無効化
  const nextBtn = document.getElementById("next");
  nextBtn.style.display = "block";
  nextBtn.disabled = true; // 押せない状態

  const labels = ["A", "B", "C", "D"];
  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.textContent = `${labels[index]}: ${option}`;
    btn.className = "option";
    btn.dataset.answer = labels[index];
    btn.onclick = () => checkAnswer(labels[index], nextBtn); // 「次へ」ボタンを渡す
    document.getElementById("options").appendChild(btn);
  });
}

function checkAnswer(selected, nextBtn) {
  const q = questions[currentQuestionIndex];
  const correctAnswer = q.answer;
  const buttons = document.querySelectorAll(".option");

  buttons.forEach((btn) => {
    btn.onclick = null; // 選択後はボタン無効化
    if (btn.dataset.answer === correctAnswer) {
      btn.classList.add("correct"); // 正解を緑色に
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

  // 「次へ」ボタンを有効化
  nextBtn.disabled = false;
}

document.getElementById("next").addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    document.getElementById("quiz-container").innerHTML = `
      <h2>テスト終了</h2>
      <p>結果: ${questions.length} 問中 ${correctCount} 問正解</p>
    `;
  }
});

// はじめからボタン
document.getElementById("start").addEventListener("click", () => {
  startQuiz(true);
});

// 復帰ボタン
document.getElementById("resume").addEventListener("click", () => {
  const savedProgress = localStorage.getItem("quizProgress");
  if (savedProgress) {
    const progress = JSON.parse(savedProgress);
    currentQuestionIndex = progress.currentQuestionIndex;
    correctCount = progress.correctCount;
    startQuiz(false);
  } else {
    alert("保存された進捗がありません。");
  }
});

// 中断ボタン
document.getElementById("pause").addEventListener("click", () => {
  saveProgress();
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("menu").style.display = "block";
});

function saveProgress() {
  localStorage.setItem(
    "quizProgress",
    JSON.stringify({ currentQuestionIndex, correctCount })
  );
}

loadCSV();
