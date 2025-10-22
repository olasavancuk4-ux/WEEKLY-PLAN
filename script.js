// логіка роботи додатку "Розклад уроків та домашніх завдань" полягає в наступному:
// 1. Отримуємо елементи з HTML, з якими будемо працювати (заголовок дня, список уроків, випадаючий список предметів для додавання домашки)
// 2. Визначаємо поточний день тижня (за замовчуванням Понеділок) та завантажуємо розклад з LocalStorage або створюємо новий
// 3. Функція для збереження розкладу в LocalStorage
// 4. Логіка перемикання днів тижня (при натисканні кнопок Понеділок, Вівторок...)
// 5. Логіка додавання нового уроку (при натисканні кнопки "Додати урок")
// 6. Функція для додавання домашнього завдання до обраного уроку
// 7. Основна функція рендеру уроків (виведення на екран) з усіма можливими діями: редагування, видалення уроку, додавання/редагування/видалення домашніх завдань


// 1. ОТРИМАННЯ ЕЛЕМЕНТІВ З HTML
// Заголовок, де показується назва дня (Понеділок, Вівторок...)
let day_title = document.querySelector('#day-title')

// Контейнер, куди будуть виводитись уроки поточного дня
let lessons_list = document.querySelector('#lessons-list')

// Випадаючий список предметів для додавання домашнього завдання
let homework_subject = document.querySelector('#homework-subject')


// 2. ПОТОЧНИЙ ДЕНЬ ТА РОЗКЛАД
// День за замовчуванням – Понеділок
let carrent_day = 'Понеділок'

// Завантаження розкладу з LocalStorage або створення нового
// де ми зберігаємо об'єкт з днями тижня та уроками
// [] - порожній масив уроків, де будуть об'єкти уроків
// уроки зберігаємо в об'єкті виду {name: "Математика", room: "204", homework: [], editing: false}
// чому у вигляді об'єкта? - щоб зберігати не лише назву та кабінет, а й домашні завдання
// чому editing: false? - це для того, щоб знати, чи знаходиться урок у режимі редагування
// homework: [] - це масив домашніх завдань, де кожне завдання - це об'єкт виду {text: "Завдання", done: false, editing: false}
// тобто фактично ми маємо вкладеність об'єктів і масивів, де розклад - це об'єкт з днями, кожен день - це масив уроків, кожен урок - це об'єкт з інформацією про урок та масивом домашніх завдань
// такий підхід дозволяє легко додавати, редагувати та видаляти уроки і домашні завдання
// структура даних дуже важлива для організації інформації в додатку


// json.parse - перетворює текст у вигляді JSON назад в об'єкт JavaScript
let schedule = JSON.parse(localStorage.getItem("schedule")) || {
    'Понеділок': [],
    'Вівторок': [],
    'Середа': [],
    'Четвер': [],
    "П'ятниця": [],
}

// 3. ФУНКЦІЯ ЗБЕРЕЖЕННЯ РОЗКЛАДУ В LOCALSTORAGE
function saveSchedule() {
    // Перетворюємо об'єкт schedule у текст (JSON) і зберігаємо в браузері
    localStorage.setItem("schedule", JSON.stringify(schedule))
}


// 4. ПЕРЕМИКАННЯ ДНІВ ТИЖНЯ
// Коли користувач натискає кнопку дня (Понеділок / Вівторок / ...),
// оновлюємо поточний день та перемальовуємо уроки
document.querySelectorAll(".day-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        // Забираємо клас "active" зі всіх кнопок (щоб підсвітити лише один день)
        document.querySelectorAll(".day-btn").forEach(b => b.classList.remove("active"))

        // Додаємо "active" лише на натиснуту кнопку
        btn.classList.add("active")

        // Зберігаємо, який день вибрав користувач, dataset - це властивість, яка дозволяє отримувати доступ до всіх атрибутів data-* елемента
        // data* - це спеціальні атрибути в HTML, які починаються з "data-" і дозволяють зберігати додаткову інформацію в елементах
        // яку ми можемо написати самі, наприклад data-day="Понеділок"
        carrent_day = btn.dataset.day

        // Показуємо назву дня у заголовку
        day_title.innerHTML = carrent_day

        // Виводимо уроки конкретного дня
        renderLessons()
    })
})


// 5. ДОДАВАННЯ УРОКУ
// При натисканні кнопки "Додати урок"
document.querySelector("#add-lesson-btn").addEventListener('click', function () {
    // Отримуємо значення з полів в html
    let nameInput = document.getElementById("lesson-name")
    let roomInput = document.getElementById("lesson-room")

    let name = nameInput.value.trim()   // Назва предмету
    let room = roomInput.value.trim()   // Кабінет

    // Перевіряємо, щоб поля не були порожні
    if (name && room) {
        // Додаємо новий урок в розклад обраного дня
        schedule[carrent_day].push({
            name: name,       // Назва предмету (наприклад: Математика)
            room: room,       // Номер кабінету (наприклад: 204)
            homework: [],     // Порожній масив для домашніх завдань
            editing: false    // Чи знаходиться цей урок у режимі редагування
        })

        // Очищуємо поля вводу
        nameInput.value = ""
        roomInput.value = ""

        // Зберігаємо та оновлюємо екран
        saveSchedule()
        renderLessons()
    }
})

// 6. ФУНКЦІЯ ДОДАВАННЯ Д/З (HOMEWORK)
function addHomework() {
    // Отримуємо елемент з html з вибраного предмета і текстом домашки
    let subjectSelect = document.querySelector('#homework-subject')
    let textInput = document.querySelector('#homework-text')

    // Отримуємо значення з полів
    let subject = subjectSelect.value
    let text = textInput.value

    // Спочатку вважаємо, що предмет не знайдено 
    // null - спеціальний тип, означає відсутність значення
    let lessonToUpdate = null

    // Шукаємо предмет у масиві уроків поточного дня
    for (let i = 0; i < schedule[carrent_day].length; i++) {
        if (schedule[carrent_day][i].name == subject) {
            lessonToUpdate = schedule[carrent_day][i]
            break
        }
    }

    // Якщо урок знайдено – додаємо домашнє завдання, якщо ні – нічого не робимо
    if (lessonToUpdate) {
        lessonToUpdate.homework.push({ text: text, done: false })
        textInput.value = ''  // Очищаємо поле
        saveSchedule()
        renderLessons()       // Оновлюємо екран
    }
}

// Подія на кнопку "Додати д/з"
document.querySelector('#add-homework-btn').addEventListener('click', addHomework)

// 7. ОСНОВНА ФУНКЦІЯ – РЕНДЕР УРОКІВ (виведення на екран)
function renderLessons() {
    // Очищаємо список уроків та список предметів (для select)
    lessons_list.innerHTML = ''
    // innerHTML - властивість, яка дозволяє отримувати або встановлювати HTML-код всередині елемента
    // тобто ми очищуємо вміст контейнера, щоб потім додати оновлені уроки
    // це важливо, щоб не було дублювання при кожному рендері
    homework_subject.innerHTML = `<option value="">виберіть предмет</option>`

    // Дістаємо всі уроки для обраного дня
    let lessons = schedule[carrent_day]

    // Перебираємо всі уроки
    for (let i = 0; i < lessons.length; i++) {

        // Поточний урок
        let lesson = lessons[i]

        // Додаємо предмет у випадаючий список для домашки (щоб можна було вибрати, куди додати д/з)
        let option = document.createElement("option")

        option.value = lesson.name
        option.innerText = lesson.name
        homework_subject.appendChild(option) // додаємо опцію в select, appendChild - метод для додавання елемента в кінець батьківського елемента

        // Створюємо контейнер для уроку, в який будемо додавати інформацію
        let div_el = document.createElement("div")
        div_el.className = "lesson" // додаємо клас для стилізації

        // Режим редагування уроку (input замість тексту)
        if (lesson.editing) {
            div_el.innerHTML = `
                <input type="text" value="${lesson.name}" class="edit-name">
                <input type="text" value="${lesson.room}" class="edit-room">
                <button class="save-lesson">зберегти</button>
            `
            // Збереження уроку після редагування
            div_el.querySelector(".save-lesson").addEventListener("click", function () {
                lesson.name = div_el.querySelector(".edit-name").value // Оновлюємо назву уроку
                lesson.room = div_el.querySelector(".edit-room").value // Оновлюємо кабінет
                lesson.editing = false // Вимикаємо режим редагування
                saveSchedule() // Зберігаємо зміни
                renderLessons() // Оновлюємо екран
            })
        }

        // Звичайний вигляд уроку
        else {
            // Виведення назви уроку та кабінету
            div_el.innerHTML = `
                <h3>${lesson.name} (${lesson.room})</h3>
                <div class="lesson-actions"> 
                    <button class="edit-lesson">редагувати</button>
                    <button class="delete-lesson">видалити</button>
                </div>
            `

            // Запуск редагування
            div_el.querySelector(".edit-lesson").addEventListener('click', function () {
                lesson.editing = true
                renderLessons()
            })

            // Видалення уроку
            div_el.querySelector(".delete-lesson").addEventListener('click', function () {
                if (confirm("точно видалити?")) {
                    lessons.splice(i, 1) // Видаляємо урок з масиву уроків (i - з якого елементу, 2-й аргумент 1 - означає видалити 1 елемент)
                    saveSchedule()
                    renderLessons()
                }
            })

            // Виведення ДОМАШНІХ ЗАВДАНЬ конкретного уроку
            for (let k = 0; k < lesson.homework.length; k++) {
                let work = lesson.homework[k] // поточне домашнє завдання в масиві домашок уроку
                let work_div = document.createElement('div') // створюємо блок для домашки
                work_div.className = "homework-el" // додаємо клас для стилізації

                // -- Редагування домашки --
                if (work.editing) {
                    work_div.innerHTML = `
                        <input type="text" value="${work.text}" class="edit-hw">
                        <button class="save-hw">зберегти </button>
                    `
                    work_div.querySelector(".save-hw").addEventListener('click', function () {
                        work.text = work_div.querySelector(".edit-hw").value
                        work.editing = false
                        saveSchedule()
                        renderLessons()
                    })
                }

                // -- Звичайний вигляд домашки --
                else {
                    work_div.innerHTML = `
                        <div>
                        <input type="checkbox" ${work.done ? "checked" : ""}>
                        <span>${work.text}</span>
                        </div>
                        <div>
                        <button class="edit-hw-btn">✏️</button>
                        <button class="delete-hw-btn">❌</button>
                        </div>
                    `
                    // Позначка "виконано"
                    work_div.querySelector("input").addEventListener('change', function (event) {
                        //event.target - це елемент, на якому сталася подія (в даному випадку - чекбокс)
                        work.done = event.target.checked // зберігаємо стан чекбокса (виконано/не виконано) в об'єкт домашки
                        saveSchedule()
                    })

                    // Редагувати д/з
                    work_div.querySelector(".edit-hw-btn").addEventListener('click', function () {
                        work.editing = true // вмикаємо режим редагування
                        renderLessons() // оновлюємо екран в якому буде режим редагування
                    })

                    // Видалити д/з
                    work_div.querySelector(".delete-hw-btn").addEventListener('click', function () {
                        lesson.homework.splice(k, 1) // видаляємо домашку з масиву домашок уроку
                        saveSchedule()
                        renderLessons()
                    })
                }

                div_el.appendChild(work_div) // додаємо домашнє завдання до блоку уроку
            }
        }

        lessons_list.appendChild(div_el) // додаємо урок до списку уроків на сторінці
    }
}

// Запускаємо рендер при завантаженні сторінки, щоб показати уроки поточного дня одразу при завантаженні сторінки
renderLessons()
