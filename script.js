let userName =
localStorage.getItem("userName") || "";

// ======================
// GREETING + CLOCK
// ======================

function updateDateTime(){

    const now = new Date();

    const hour = now.getHours();

    let greeting = "";

    if(hour < 12){
        greeting = "Good Morning";
    }
    else if(hour < 18){
        greeting = "Good Afternoon";
    }
    else{
        greeting = "Good Evening";
    }

    if(userName){
        greeting += ", " + userName;
    }

    document.getElementById("greeting").textContent =
        greeting;

    document.getElementById("dateTime").textContent =
        now.toLocaleString();
}

// NEW LINE

document
.getElementById("saveNameBtn")
.addEventListener("click",()=>{

    userName =
    document.getElementById("userName").value;

    localStorage.setItem(
        "userName",
        userName
    );

    updateDateTime();
});

setInterval(updateDateTime,1000);
updateDateTime();


// ======================
// POMODORO TIMER
// ======================

let timer;

// NEW LINE

let pomodoroMinutes =
parseInt(
    localStorage.getItem("pomodoro")
) || 25;

let timeLeft =
pomodoroMinutes * 60;

// NEW LINE
const pomodoroSelect =
document.getElementById(
    "pomodoroSelect"
);

pomodoroSelect.value =
pomodoroMinutes;

pomodoroSelect.addEventListener(
    "change",
    ()=>{

        pomodoroMinutes =
        parseInt(
            pomodoroSelect.value
        );

        localStorage.setItem(
            "pomodoro",
            pomodoroMinutes
        );

        clearInterval(timer);

        timeLeft =
        pomodoroMinutes * 60;

        updateTimerDisplay();
    }
);

function updateTimerDisplay(){

    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    document.getElementById("timer").textContent =
        `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

document.getElementById("startBtn").addEventListener("click",()=>{

    clearInterval(timer);

    timer = setInterval(()=>{

        if(timeLeft > 0){
            timeLeft--;
            updateTimerDisplay();
        }

    },1000);
});

document.getElementById("stopBtn").addEventListener("click",()=>{

    clearInterval(timer);

});

document.getElementById("resetBtn").addEventListener("click",()=>{

    clearInterval(timer);

// NEW LINE

    timeLeft =
pomodoroMinutes * 60;

    updateTimerDisplay();

});

updateTimerDisplay();


// ======================
// TO DO LIST
// ======================

let tasks =
JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks(){

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}

function renderTasks(){

    const taskList =
    document.getElementById("taskList");

    taskList.innerHTML = "";

    tasks.forEach((task,index)=>{

        const li =
        document.createElement("li");

        li.innerHTML = `
            <span class="${task.done ? 'done':''}">
                ${task.text}
            </span>

            <div class="task-buttons">
                <button onclick="toggleTask(${index})">
                    ✔
                </button>

                <button onclick="editTask(${index})">
                    Edit
                </button>

                <button onclick="deleteTask(${index})">
                    Delete
                </button>
            </div>
        `;

        taskList.appendChild(li);
    });
}

document.getElementById("addTaskBtn")
.addEventListener("click",()=>{

    const input =
    document.getElementById("taskInput");

    if(input.value.trim() === "") return;

    tasks.push({
        text: input.value,
        done:false
    });

    input.value="";

    saveTasks();
    renderTasks();
});

function toggleTask(index){

    tasks[index].done =
    !tasks[index].done;

    saveTasks();
    renderTasks();
}

function editTask(index){

    const newText =
    prompt(
        "Edit task",
        tasks[index].text
    );

    if(newText){

        tasks[index].text = newText;

        saveTasks();
        renderTasks();
    }
}

function deleteTask(index){

    tasks.splice(index,1);

    saveTasks();
    renderTasks();
}

renderTasks();


// ======================
// QUICK LINKS
// ======================

let links =
JSON.parse(localStorage.getItem("links")) || [];

function saveLinks(){

    localStorage.setItem(
        "links",
        JSON.stringify(links)
    );
}

function renderLinks(){

    const container =
    document.getElementById("linksContainer");

    container.innerHTML = "";

    links.forEach((link,index)=>{

        const wrapper =
        document.createElement("div");

        wrapper.innerHTML = `
            <a class="link-btn"
               href="${link.url}"
               target="_blank">
               ${link.name}
            </a>

            <button onclick="deleteLink(${index})">
                X
            </button>
        `;

        container.appendChild(wrapper);
    });
}

document.getElementById("addLinkBtn")
.addEventListener("click",()=>{

    const name =
    document.getElementById("linkName").value;

    const url =
    document.getElementById("linkUrl").value;

    if(!name || !url) return;

    links.push({name,url});

    saveLinks();
    renderLinks();

    document.getElementById("linkName").value="";
    document.getElementById("linkUrl").value="";
});

function deleteLink(index){

    links.splice(index,1);

    saveLinks();
    renderLinks();
}

renderLinks();

// DARK THEME

const themeBtn =
document.getElementById("themeBtn");

let darkMode =
localStorage.getItem("darkMode");

if(darkMode === "true"){

    document.body.classList.add("dark");

    themeBtn.textContent =
    "☀️ Light Mode";
}

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    const isDark =
    document.body.classList.contains("dark");

    localStorage.setItem(
        "darkMode",
        isDark
    );

    themeBtn.textContent =
    isDark
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
});