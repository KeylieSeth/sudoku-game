// ===== STATE =====
let life;
let gameLost;
let hasWon;
let noteMode = false;
let eraserMode = false;
let selectedCell = null;

// ===== DOM =====
const cells = document.querySelectorAll(".cell:not(.g)");
const numbers = document.querySelectorAll(".number");
const gameOverBox = document.querySelector(".gameOverBox");
const gameOverBox2 = document.querySelector(".box2");
const gameOverBox3 = document.querySelector(".box3");
const fireworks = document.querySelector(".fireworks");
const hearts = document.querySelectorAll(".heart");
const yes = document.querySelector(".yes");
const no = document.querySelector(".no");
const reload = document.querySelector(".reload");
const playAgain = document.querySelector(".playAgain");
const close = document.querySelector(".close");
const buttons = document.querySelectorAll(".symbols button:not(.bulb)");
const bulb = document.querySelector(".bulb");

// ===== INIT =====
game(); //Start the game.

// ===== EVENTS =====
// cell clicks
cells.forEach(cell => {
  cell.addEventListener("click", handleCellClick);
});

document.addEventListener("click", handleOutsideClick);

// keyboard
document.addEventListener("keydown", handleKeyInput);

// number pad
numbers.forEach(n => {
  n.addEventListener("click", handleBoxClick);
});

// buttons
buttons.forEach(button => {
  button.addEventListener("click", handleSymbolClick);
});

bulb.addEventListener("click", handleBulbClick);

no.addEventListener("click", handleNoClick);
yes.addEventListener("click", restartGame);
reload.addEventListener("click", restartGame);
playAgain.addEventListener("click", restartGame);

close.addEventListener("click", handleCloseWinBox);

// ===== INPUT =====
function handleCellClick(e){
  const cell = e.currentTarget;

  if (hasWon) return;
  e.stopPropagation(); //no clicks outside of sudoku box.

  if (eraserMode) {
    handleEraser(cell);
    return;
  }
  //Remove wrong guesses when new cell is selected.
    document.querySelectorAll(".guess.wrong").forEach(g => {
    g.classList.remove("wrong");
    });

    //selecting the same cell again = deselect.
    if (selectedCell === cell) {
      cell.classList.remove("selected");
      selectedCell = null;
      return;
    }

    //switching to another cell.
    if (selectedCell) {
      selectedCell.classList.remove("selected");
    }

    cell.classList.add("selected");
    selectedCell = cell;
}

//clicks outside of the sudoku box deselects cells.
function handleOutsideClick(){
  if (selectedCell) {
      selectedCell.classList.remove("selected");
      selectedCell = null;
    }
}

//Enter a guess by using the keyboard.
function handleKeyInput(e){
  if (gameLost) return;
  if (!selectedCell) return;
  if (e.key < "1" || e.key > "9") return;
    
  handleInput(e.key);
}

//To enter a guess by using the number box.
function handleBoxClick(e){
  if (gameLost) return; 
  e.stopPropagation();

  const n = e.currentTarget;
  const value = n.textContent.trim();

  if (!selectedCell) return;

  handleInput(value);
}

function handleSymbolClick(e){
  e.stopPropagation();

  const button = e.currentTarget;

  const icon1 = button.querySelector(".icon1"); //pencil
  const icon2 = button.querySelector(".icon2"); //eraser

  const isActive = button.classList.contains("active");

  //reset buttons
  buttons.forEach(b => {
    b.classList.remove("active");
    b.querySelector(".icon1").classList.remove("hidden");
    b.querySelector(".icon2").classList.add("hidden");
  });

  //activate if not active
  if (!isActive) {
    button.classList.add("active");
    icon1.classList.add("hidden");
    icon2.classList.remove("hidden");
  }

  noteMode = button.classList.contains("pen") && !isActive;
  eraserMode = button.classList.contains("eraser") && !isActive;

  if (eraserMode) {
    if (selectedCell) {
      selectedCell.classList.remove("selected");
      selectedCell = null;
    }
  }
}

function handleBulbClick(){
  bulb.classList.add("active");
  getHint();

  setTimeout(() => {
      bulb.classList.remove("active");
  }, 650);
}

// ===== LOGIC =====
function handleInput(value) {
  if (selectedCell.classList.contains("locked")) return;
  if (!selectedCell) return;
  if (gameLost) return;
  if (hasWon) return;

  const counts = getCounts();
  if (counts[value] === 9) return;

  if (noteMode) {
    handleNotes(value);
  }
  else {
    handleGuess(value);
  }
}

function handleGuess(value) {
  if (hasWon) return;

  const currentCell = selectedCell;
  const correctValue = selectedCell.dataset.value;

  if (value === correctValue) {
    handleCorrectGuess(currentCell, value);
  } else {
    handleWrongGuess(currentCell, value);
  }
}

function handleCorrectGuess(cell, value){
  const guessElement = cell.querySelector(".guess");
  if (!guessElement) return; 

  guessElement.textContent = value;
  guessElement.classList.add("revealed");

  cell.classList.remove("wrong");

  cell.querySelector(".notes").textContent = "";
  cell.classList.add("locked");

  updateNumberBoard();
  highlightCompletedNumbers();

  if (gameWon()) {
    hasWon = true;
    gameOverBox3.classList.add("showBox");
  }
}

function handleWrongGuess(cell, value){
  const guessElement = cell.querySelector(".guess");
  if (!guessElement) return; 

  looseLife();
  cell.classList.add("wrong");

  guessElement.textContent = value;
  guessElement.classList.add("revealed");

  isLost();

  setTimeout(() => {
    if (cell.classList.contains("locked")) return;

    guessElement.classList.remove("revealed");
    guessElement.textContent = "";
    cell.classList.remove("wrong");
  }, 350);
}

function isLost() {
  if (life === 0) {
    gameLost = true;
    gameOverBox.classList.add("showBox");
    document.body.classList.add("show-overlay");
    }
}

function looseLife() {
  if (life <= 0) return;

  life--;

  hearts[life].classList.add("minushp");
}

function gameWon() {
  const cells = document.querySelectorAll(".cell");

  for (let cell of cells) {
    if (cell.classList.contains("g")) continue;

    const guess = cell.querySelector(".guess");

    if (!guess || !guess.classList.contains("revealed")) {
      return false;
    }
  }
  return true;
}

function getHint(){
  const hints = document.querySelectorAll(".cell:not(.g) .guess:not(.revealed)");
  if (hints.length === 0) return;
  else {
    const randomIndex = Math.floor(Math.random() * hints.length);
    const randomHint = hints[randomIndex];

    const cell = randomHint.closest(".cell");
    const correctValue = cell.dataset.value;
    
    randomHint.textContent = correctValue;
    randomHint.classList.add("hint");

    setTimeout(() => {
      randomHint.classList.remove("hint"); 
    }, 700);

    randomHint.classList.add("revealed");
  }
}

function handleNotes(value) {
  if (!selectedCell) return;

  const notes = selectedCell.querySelector(".notes");
  if (notes.textContent.includes(value)) {
    notes.textContent = notes.textContent.replace(value, "");
  } else {
    notes.textContent += value;
  }
}

function handleEraser(cell) {
  if (cell.classList.contains("g")) return;
  if (cell.classList.contains("locked")) return;

  const eraser = cell.querySelector(".notes");
  
  eraser.textContent = "";
}

function getCounts() {
  const counts = Array(10).fill(0);

  document.querySelectorAll(".cell").forEach(cell => {
    let value = null;

    if (cell.classList.contains("g")) {
      const given = cell.querySelector(".given");
      if (given) value = given.textContent;
    } else {
      const guess = cell.querySelector(".guess");
      if (guess && guess.classList.contains("revealed")) {
        value = guess.textContent;
      }
    }

    if (value) counts[Number(value)]++;
  });

  return counts;
}

// ===== UI =====
function resetSymbols() {
  const buttons = document.querySelectorAll(".symbols button");

  buttons.forEach(button => {
    button.classList.remove("active");

    const icon1 = button.querySelector(".icon1");
    const icon2 = button.querySelector(".icon2");

    if (icon1 && icon2) {
      icon1.classList.remove("hidden");
      icon2.classList.add("hidden");
    }
  });
}

function handleNoClick(){
  gameOverBox.classList.remove("showBox");
  gameOverBox2.classList.add("showBox")
  document.body.classList.add("show-overlay");
}

function handleCloseWinBox(){
  gameOverBox3.classList.remove("showBox");
  document.body.classList.remove("show-overlay");
  fireworks.classList.remove("show");
}

function updateNumberBoard() {
  const counts = getCounts();

  numbers.forEach(n => {
    const num = n.textContent.trim();

    if (counts[Number(num)] === 9) {
      n.classList.add("completed");
    } else {
      n.classList.remove("completed");
    }
  });
}

function highlightCompletedNumbers() {
  const counts = getCounts();

  document.querySelectorAll(".cell").forEach(cell => {
    let value = null;

    if (cell.classList.contains("g")) {
      const given = cell.querySelector(".given");
      if (given) value = given.textContent;
    } else {
      const guess = cell.querySelector(".guess");
      if (guess && guess.classList.contains("revealed")) {
        value = guess.textContent;
      }
    }

    if (value && counts[Number(value)] === 9) {
      cell.classList.add("number-complete");

      setTimeout(() => {
        cell.classList.remove("number-complete");
      }, 700);
    }
  });
}

// ===== GAME =====
function game(){
  resetGameState();
  resetUI();
}

function resetGameState(){
  life = 3;
  gameLost = false;
  hasWon = false;

  if (selectedCell) {
    selectedCell.classList.remove("selected");
  }
  selectedCell = null;
}

function resetUI(){
  //Resets hearts when restarting the game.
  hearts.forEach(h => h.classList.remove("minushp"));

  //Clear completed numbers from the number board.
  numbers.forEach(n => {
  n.classList.remove("completed");
  });

  //Unlock correctly guessed cells and remove higlights.
  document.querySelectorAll(".cell").forEach(c => {
  c.classList.remove("locked", "number-complete");
  });

  //Clear all guesses.
  document.querySelectorAll(".guess").forEach(g => {
    g.classList.remove("revealed");
    g.textContent = "";
  });

  //Reset symbol buttons (notes(eraser).
  resetSymbols()

  //CLear all notes from the board.
  document.querySelectorAll(".notes").forEach(n => {
  n.textContent = "";
  });

  //Hide game over/win UI and effects.
  gameOverBox.classList.remove("showBox");
  gameOverBox2.classList.remove("showBox");
  gameOverBox3.classList.remove("showBox");
  document.body.classList.remove("show-overlay");
  fireworks.classList.remove("show");
}

function restartGame() {
  game();
}

// ===== TESTING =====
function autoSolve() {
  const cells = document.querySelectorAll(".cell");

  cells.forEach(cell => {
    const correctValue = cell.dataset.value;
    const guessElement = cell.querySelector(".guess");

    if (guessElement && !guessElement.classList.contains("revealed")) {
      guessElement.textContent = correctValue;
      guessElement.classList.add("revealed");
    }
  });

  // trigga win check
  if (!hasWon && gameWon()) {
    hasWon = true;
    gameOverBox3.classList.add("showBox");
    document.body.classList.add("show-overlay");
    fireworks.classList.add("show");
  }
}