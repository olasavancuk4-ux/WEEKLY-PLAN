let day_title = document.querySelector('#day-title')
let lessons_list = document.querySelector('#lessons-list')
let homework_subject = document.querySelector('#homework-subject')

let carrent_day = 'Понеділок'

let schedule = JSON.parse(localStorage.getItem("schedule")) ||
{
    'Понеділок': [],
    'Вівторок': [],
    'Середа': [],
    'Четвер': [],
    "П'ятниця": [],
}


function saveSchedule() {
    localStorage.setItem("schedule", JSON.stringify(schedule))
}

document.querySelector("#add-lesson-btn").addEventListener('click', function () {
    let name = document.querySelector('#lesson-name').value
    let room = document.querySelector('#lesson-room').value

    if (name.trim() != '') {
        schedule[carrent_day].push({ name, room, homework: [] })
        document.querySelector('#lesson-name').value = ''
        document.querySelector('#lesson-room').value = ''
        saveSchedule()

    }
})

function addHomework() {
    let subjectSelect = document.querySelector('#homework-subject')
    let textInput = document.querySelector('#homework-subject')
    let subject = subjectSelect.value
    let text = textInput.value

    let lessonToUpdate

    for (let i = 0; i < schedule[carrent_day].length; i++) {
        if (schedule[carrent_day][i].name == subject) {
            lessonToUpdate = schedule[carrent_day][i]
            break
        }
    }
    if (lessonToUpdate) {
        lessonToUpdate.homework.push({ text: text, done: false })
        textInput.value = ''
        saveSchedule()
        renderLessons()

    }
}

document.querySelector('#add-homework-btn').addEventListener('click', addHomework)

function renderLessons() {
    lessons_list.innerHTML = ''
    homework_subject.innerHTML = `<option value="">виберіть предмет</option>`
    let lessons = schedule[carrent_day]

    for (let i = 0; i < lessons.length; i++) {
        let lesson = lessons[i]

        let div_el = document.createElement("div")
        div_el.className = "lesson"
        if (lesson.editing) {
            div_el.innerHTML = `
        <input type="text" value="${lesson.name}" class="edit-name">
        <input type="text" value="${lesson.room}" class="edit-room">
        <button class="save-lesson">зберегти</button>
        `
            div_el.querySelector("save-lesson").addEventListener("click", function () {
                lesson.name = div_el.querySelector(".edit-name").value
                lesson.room = div_el.querySelector(".edit-room").value
                lesson.editing = false
                saveSchedule();
                renderLessons()
            })
        } else {
            div_el.innerHTML = `
                <h3>${lesson.name} (${lesson.room})</h3>
                <div class="lesson-actions"> 
                <button class="edit-lesson">редагувати</button>
                <button class="delete-lesson">видалити</button>
                </div>
                `
            div_el.querySelector(".edit-lesson").addEventListener('click', function () {
                lesson.editing = true
                renderLessons()
            })
            div_el.querySelector(".delete-lesson").addEventListener('click', function () {
                if (confirm("точно видалити?")) {
                    lessons.splice(i, 1)
                    saveSchedule()
                    renderLessons()
                }
            })

            for(let k=0;k<lesson.homework.length;k++){
                let work=lesson.homework[k]
                let work_div=document.createElement('div')
                work_div.className="homework-el"

                if(work.editing){}
            }
        }
    }
}