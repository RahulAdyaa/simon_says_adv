//Initial References
const countValue = document.getElementById("count");
const colorPart = document.querySelectorAll(".color-part");
const container = document.querySelector(".container");
const startButton = document.querySelector("#start");
const result = document.querySelector("#result");
const wrapper = document.querySelector(".wrapper");
const difficultyDisplay = document.getElementById("difficulty-display");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

//Sound Effects
const sounds = {
    green: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
    red: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
    blue: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"),
    yellow: new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"),
    wrong: new Audio("https://s3.amazonaws.com/freecodecamp/wrong.mp3")
};

//Mapping Colors By Creating Colors Object
const colors = {
    color1: {
        current: "#068e06",
        new: "#11e711",
        sound: sounds.green
    },
    color2: {
        current: "#950303",
        new: "#fd2a2a",
        sound: sounds.red
    },
    color3: {
        current: "#01018a",
        new: "#2062fc",
        sound: sounds.blue
    },
    color4: {
        current: "#919102",
        new: "#fafa18",
        sound: sounds.yellow
    }
};

//Game State Variables
let randomColors = [];
let pathGeneratorBool = false;
let count, clickCount = 0;
let currentDifficulty = "easy";
let highScores = {
    easy: 0,
    medium: 0,
    hard: 0
};

//Load high scores from localStorage
const loadHighScores = () => {
    const savedScores = localStorage.getItem("simonHighScores");
    if (savedScores) {
        highScores = JSON.parse(savedScores);
        updateHighScoreDisplay();
    }
};

//Save high scores to localStorage
const saveHighScores = () => {
    localStorage.setItem("simonHighScores", JSON.stringify(highScores));
};

//Update high score display
const updateHighScoreDisplay = () => {
    document.getElementById("easy-high-score").textContent = highScores.easy;
    document.getElementById("medium-high-score").textContent = highScores.medium;
    document.getElementById("hard-high-score").textContent = highScores.hard;
};

//Difficulty Settings
const difficultySettings = {
    easy: {
        delay: 100,
        displayDelay: 200,
        clickDelay: 100
    },
    medium: {
        delay: 80,
        displayDelay: 150,
        clickDelay: 80
    },
    hard: {
        delay: 60,
        displayDelay: 100,
        clickDelay: 60
    }
};

//Load high scores when page loads
loadHighScores();

//Difficulty Selection
difficultyButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentDifficulty = button.dataset.difficulty;
        difficultyDisplay.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
        startButton.classList.remove("hide");
    });
});

//Function to start game
startButton.addEventListener("click", () => {
    count = 0;
    clickCount = 0;
    randomColors = [];
    pathGeneratorBool = false;
    wrapper.classList.remove("hide");
    container.classList.add("hide");
    pathGenerate();
});

//Function to decide the sequence
const pathGenerate = () => {
    randomColors.push(generateRandomValue(colors));
    count = randomColors.length;
    pathGeneratorBool = true;
    pathDecide(count);
};

//Function to get a random value from object
const generateRandomValue = (obj) => {
    let arr = Object.keys(obj);
    return arr[Math.floor(Math.random() * arr.length)];
};

//Function to play the sequence
const pathDecide = async (count) => {
    countValue.innerText = count;
    const settings = difficultySettings[currentDifficulty];
    
    for (let i of randomColors) {
        let currentColor = document.querySelector(`.${i}`);
        await delay(settings.delay);
        
        //Play sound and highlight color
        colors[i].sound.currentTime = 0;
        colors[i].sound.play();
        currentColor.style.backgroundColor = `${colors[i]["new"]}`;
        currentColor.classList.add("active");
        
        await delay(settings.displayDelay);
        
        currentColor.style.backgroundColor = `${colors[i]["current"]}`;
        currentColor.classList.remove("active");
        await delay(settings.clickDelay);
    }
    pathGeneratorBool = false;
};

//Delay for blink effect
async function delay(time) {
    return await new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

//When user click on the colors
colorPart.forEach((element) => {
    element.addEventListener("click", async (e) => {
        if (pathGeneratorBool) {
            return false;
        }

        const clickedColor = e.target.classList[0];
        const settings = difficultySettings[currentDifficulty];

        if (clickedColor === randomColors[clickCount]) {
            //Play sound and highlight color
            colors[clickedColor].sound.currentTime = 0;
            colors[clickedColor].sound.play();
            e.target.style.backgroundColor = `${colors[clickedColor]["new"]}`;
            e.target.classList.add("active");
            
            await delay(settings.clickDelay);
            
            e.target.style.backgroundColor = `${colors[clickedColor]["current"]}`;
            e.target.classList.remove("active");
            
            clickCount += 1;

            if (clickCount === count) {
                clickCount = 0;
                pathGenerate();
            }
        } else {
            sounds.wrong.currentTime = 0;
            sounds.wrong.play();
            lose();
        }
    });
});

//Function when player executes wrong sequence
const lose = () => {
    //Update high score if current score is higher
    if (count > highScores[currentDifficulty]) {
        highScores[currentDifficulty] = count;
        saveHighScores();
        updateHighScoreDisplay();
    }

    result.innerHTML = `<span>Your Score: </span> ${count}`;
    result.classList.remove("hide");
    container.classList.remove("hide");
    wrapper.classList.add("hide");
    startButton.innerText = "Play Again";
    startButton.classList.remove("hide");
};