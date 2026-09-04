/* =========================================
   TASK VAULT
   SUPABASE DATABASE
========================================= */


/* =========================================
   SUPABASE CONFIG
========================================= */

const SUPABASE_URL =
    "https://ixdwiazefaaajydcohgc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_NowNDOlf5_ysmjIvbUSZXw_esLgw4Eg";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================
   ELEMENT
========================================= */

const homePage =
    document.getElementById("homePage");

const dashboardPage =
    document.getElementById("dashboardPage");

const enterDashboard =
    document.getElementById("enterDashboard");

const listMenu =
    document.getElementById("listMenu");

const addMenu =
    document.getElementById("addMenu");

const addTaskFromList =
    document.getElementById("addTaskFromList");

const taskListSection =
    document.getElementById("taskListSection");

const addTaskSection =
    document.getElementById("addTaskSection");

const taskForm =
    document.getElementById("taskForm");

const taskContainer =
    document.getElementById("taskContainer");

const totalTasks =
    document.getElementById("totalTasks");

const upcomingTasks =
    document.getElementById("upcomingTasks");

const categoryCount =
    document.getElementById("categoryCount");


/* =========================================
   DATA TUGAS
========================================= */

let tasks = [];


/* =========================================
   MASUK DASHBOARD
========================================= */

enterDashboard.addEventListener("click", function () {

    homePage.classList.add("hidden");

    dashboardPage.classList.remove("hidden");

    showTaskList();

});


/* =========================================
   MENU LIST TUGAS
========================================= */

listMenu.addEventListener("click", function () {

    showTaskList();

});


/* =========================================
   MENU ADD / DELETE
========================================= */

addMenu.addEventListener("click", function () {

    showAddTask();

});


/* =========================================
   BUTTON TAMBAH DARI LIST
========================================= */

addTaskFromList.addEventListener("click", function () {

    showAddTask();

});


/* =========================================
   TAMPILKAN LIST TUGAS
========================================= */

function showTaskList() {

    taskListSection.classList.remove("hidden");

    addTaskSection.classList.add("hidden");

    listMenu.classList.add("active");

    addMenu.classList.remove("active");

    loadTasks();

}


/* =========================================
   TAMPILKAN FORM TAMBAH
========================================= */

function showAddTask() {

    taskListSection.classList.add("hidden");

    addTaskSection.classList.remove("hidden");

    listMenu.classList.remove("active");

    addMenu.classList.add("active");

}


/* =========================================
   TAMBAH TUGAS
========================================= */

taskForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const course =
        document.getElementById("course").value.trim();

    const className =
        document.getElementById("className").value.trim();

    const deadline =
        document.getElementById("deadline").value;

    const category =
        document.getElementById("category").value;


    /* Validasi */

    if (
        !course ||
        !className ||
        !deadline ||
        !category
    ) {

        alert("Semua data tugas harus diisi.");

        return;

    }


    /* Tombol loading */

    const submitButton =
        taskForm.querySelector(".submit-button");

    submitButton.disabled = true;

    submitButton.textContent =
        "MENYIMPAN...";


    /* =========================================
       INSERT KE SUPABASE
    ========================================= */

    const { data, error } =
        await supabaseClient
            .from("tasks")
            .insert([
                {
                    course: course,
                    class_name: className,
                    deadline: deadline,
                    category: category
                }
            ])
            .select();


    /* =========================================
       CEK ERROR
    ========================================= */

    if (error) {

        console.error(
            "Supabase INSERT Error:",
            error
        );

        alert(
            "Gagal menambahkan tugas.\n\n" +
            error.message
        );

        submitButton.disabled = false;

        submitButton.textContent =
            "+ TAMBAH TUGAS";

        return;

    }


    /* =========================================
       BERHASIL
    ========================================= */

    console.log(
        "Tugas berhasil ditambahkan:",
        data
    );


    taskForm.reset();


    submitButton.disabled = false;

    submitButton.textContent =
        "+ TAMBAH TUGAS";


    alert("Tugas berhasil ditambahkan!");


    /* Kembali ke daftar */

    showTaskList();

});


/* =========================================
   LOAD TUGAS DARI SUPABASE
========================================= */

async function loadTasks() {

    taskContainer.innerHTML = `

        <div class="empty-task">

            <div class="empty-icon">
                _
            </div>

            <h3>
                Loading...
            </h3>

            <p>
                Mengambil data tugas dari database.
            </p>

        </div>

    `;


    const { data, error } =
        await supabaseClient
            .from("tasks")
            .select("*")
            .order("deadline", {
                ascending: true
            });


    /* =========================================
       ERROR
    ========================================= */

    if (error) {

        console.error(
            "Supabase SELECT Error:",
            error
        );


        taskContainer.innerHTML = `

            <div class="empty-task">

                <div class="empty-icon">
                    !
                </div>

                <h3>
                    DATABASE ERROR
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>

        `;

        return;

    }


    /* Simpan data */

    tasks = data || [];


    /* Tampilkan */

    renderTasks();

}


/* =========================================
   RENDER TUGAS
========================================= */

function renderTasks() {

    taskContainer.innerHTML = "";


    /* =========================================
       BELUM ADA TUGAS
    ========================================= */

    if (tasks.length === 0) {

        taskContainer.innerHTML = `

            <div id="emptyTask" class="empty-task">

                <div class="empty-icon">
                    _
                </div>

                <h3>
                    Belum ada tugas
                </h3>

                <p>
                    Tambahkan tugas kuliah kamu melalui menu
                    <b>Add / Delete</b>.
                </p>

            </div>

        `;


        updateStatistics();

        return;

    }


    /* =========================================
       BUAT CARD TUGAS
    ========================================= */

    tasks.forEach(function (task) {

        const card =
            document.createElement("div");


        card.className =
            "task-card";


        card.innerHTML = `

            <div>

                <div class="task-name">
                    ${escapeHTML(task.course)}
                </div>

                <div class="task-course">
                    CLASS // ${escapeHTML(task.class_name)}
                </div>

            </div>


            <div class="task-deadline">

                <small>
                    DEADLINE
                </small>

                ${formatDate(task.deadline)}

            </div>


            <div>

                <span class="task-category">
                    ${escapeHTML(task.category)}
                </span>

            </div>


            <div>

                <button
                    class="delete-button"
                    onclick="deleteTask(${task.id})"
                >
                    DELETE
                </button>

            </div>

        `;


        taskContainer.appendChild(card);

    });


    updateStatistics();

}


/* =========================================
   HAPUS TUGAS
========================================= */

async function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Yakin ingin menghapus tugas ini?"
        );


    if (!confirmDelete) {

        return;

    }


    /* =========================================
       DELETE DARI SUPABASE
    ========================================= */

    const { error } =
        await supabaseClient
            .from("tasks")
            .delete()
            .eq("id", id);


    /* =========================================
       CEK ERROR
    ========================================= */

    if (error) {

        console.error(
            "Supabase DELETE Error:",
            error
        );

        alert(
            "Gagal menghapus tugas.\n\n" +
            error.message
        );

        return;

    }


    /* =========================================
       BERHASIL
    ========================================= */

    console.log(
        "Tugas berhasil dihapus:",
        id
    );


    alert("Tugas berhasil dihapus!");


    /* Ambil data terbaru */

    await loadTasks();

}


/* =========================================
   UPDATE STATISTIK
========================================= */

function updateStatistics() {

    /* TOTAL TUGAS */

    totalTasks.textContent =
        tasks.length;


    /* =========================================
       DEADLINE MENDATANG
    ========================================= */

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const upcoming =
        tasks.filter(function (task) {

            if (!task.deadline) {
                return false;
            }


            const deadline =
                new Date(
                    task.deadline + "T00:00:00"
                );


            return deadline >= today;

        });


    upcomingTasks.textContent =
        upcoming.length;


    /* =========================================
       JUMLAH KATEGORI
    ========================================= */

    const categories =
        new Set(
            tasks.map(function (task) {

                return task.category;

            })
        );


    categoryCount.textContent =
        categories.size;

}


/* =========================================
   FORMAT TANGGAL
========================================= */

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================
   KEAMANAN DASAR HTML
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text ?? "";


    return div.innerHTML;

}


/* =========================================
   LOAD DATA SAAT WEBSITE DIMULAI
========================================= */

loadTasks();