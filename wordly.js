const letters = document.querySelectorAll(".mainboard-letter");
const loadingDiv = document.querySelectorAll('.info-bar');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;
    const mobileInput = document.getElementById('mobile-input'); // Grab the hidden input for mobile

    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    let done = false;
    isLoading = false;

    // Listen for virtual keyboard input on mobile
    mobileInput.addEventListener('input', (event) => {
        const letter = event.target.value.toUpperCase();
        if (isLetter(letter)) {
            addLetter(letter);
        }
        mobileInput.value = ''; // Clear input after processing
    });

    // Focus the hidden input when the board is clicked (useful for mobile)
    document.querySelector('.mainboard').addEventListener('click', () => {
        mobileInput.focus(); // Show the mobile keyboard
    });

    document.addEventListener('keydown', function handleKeypress(event) {
        if (done || isLoading) return;

        const action = event.key;

        if (action === 'Enter') {
            commit();
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase());
        }
    });

    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }
        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            return;
        }

        isLoading = true;

        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        isLoading = false;

        if (!validWord) {
            markInvalidWord();
            return;
        }

        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] !== wordParts[i] && wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                map[guessParts[i]]--;
            } else if (guessParts[i] !== wordParts[i]) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            }
        }

        currentRow++;

        if (currentGuess === word) {
            alert("You Win!");
            document.querySelector('.brand').classList.add("winner");
            done = true;
        } else if (currentRow === ROUNDS) {
            alert(`You Lose! The word was ${word}`);
            done = true;
        }

        currentGuess = '';
    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidWord() {
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
            setTimeout(() => {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
            }, 10);
        }
    }

    function isLetter(letter) {
        return /^[a-zA-Z]$/.test(letter);
    }

    function setLoading(isLoading) {
        loadingDiv.classList.toggle('show', isLoading);
    }

    function makeMap(array) {
        const obj = {};
        for (let i = 0; i < array.length; i++) {
            const letter = array[i];
            if (obj[letter]) {
                obj[letter]++;
            } else {
                obj[letter] = 1;
            }
        }
        return obj;
    }
}

init();
