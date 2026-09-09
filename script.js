// =====================================================
// TASK VAULT
// SCRIPT.JS
// =====================================================


// =====================================================
// SUPABASE CONFIGURATION
// =====================================================

// Gunakan URL dan publishable/anon key Supabase
// yang sebelumnya sudah kamu gunakan di project kamu.

const SUPABASE_URL = "https://ixdwiazefaaajydcohgc.supabase.co";

const SUPABASE_KEY = "sb_publishable_NowNDOlf5_ysmjIvbUSZXw_esLgw4Eg";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================================
// ELEMENT
// =====================================================

const homePage = document.getElementById("homePage");
const dashboardPage = document.getElementById("dashboardPage");

const enterDashboard =
    document.getElementById("enterDashboard");

const listMenu =
    document.getElementById("listMenu");

const scheduleMenu =
    document.getElementById("scheduleMenu");

const addMenu =
    document.getElementById("addMenu");

const taskListSection =
    document.getElementById("taskListSection");

const scheduleSection =
    document.getElementById("scheduleSection");

const addTaskSection =
    document.getElementById("addTaskSection");

const addTaskFromList =
    document.getElementById("addTaskFromList");

const taskForm =
    document.getElementById("taskForm");

const courseInput =
    document.getElementById("course");

const classInput =
    document.getElementById("className");

const deadlineInput =
    document.getElementById("deadline");

const categoryInput =
    document.getElementById("category");

const formTitle =
    document.getElementById("formTitle");

const submitTaskButton =
    document.getElementById("submitTaskButton");

const cancelEditButton =
    document.getElementById("cancelEditButton");

const taskContainer =
    document.getElementById("taskContainer");

const totalTasksElement =
    document.getElementById("totalTasks");

const upcomingTasksElement =
    document.getElementById("upcomingTasks");


// =====================================================
// STATE
// =====================================================

let tasks = [];

let editingTaskId = null;


// =====================================================
// MASUK DASHBOARD
// =====================================================

enterDashboard.addEventListener("click", () => {

    homePage.classList.add("hidden");

    dashboardPage.classList.remove("hidden");

    loadTasks();

});


// =====================================================
// MENU LIST TUGAS
// =====================================================

listMenu.addEventListener("click", () => {

    showSection("list");

});


// =====================================================
// MENU JADWAL
// =====================================================

scheduleMenu.addEventListener("click", () => {

    showSection("schedule");

});


// =====================================================
// MENU ADD / DELETE
// =====================================================

addMenu.addEventListener("click", () => {

    showSection("add");

});


// =====================================================
// BUTTON TAMBAH DARI LIST
// =====================================================

addTaskFromList.addEventListener("click", () => {

    startAddMode();

    showSection("add");

});


// =====================================================
// MENAMPILKAN SECTION
// =====================================================

function showSection(section) {

    taskListSection.classList.add("hidden");

    scheduleSection.classList.add("hidden");

    addTaskSection.classList.add("hidden");


    listMenu.classList.remove("active");

    scheduleMenu.classList.remove("active");

    addMenu.classList.remove("active");


    if (section === "list") {

        taskListSection.classList.remove("hidden");

        listMenu.classList.add("active");

        loadTasks();

    }


    if (section === "schedule") {

        scheduleSection.classList.remove("hidden");

        scheduleMenu.classList.add("active");

    }


    if (section === "add") {

        addTaskSection.classList.remove("hidden");

        addMenu.classList.add("active");

    }

}


// =====================================================
// LOAD TASKS DARI SUPABASE
// =====================================================

async function loadTasks() {

    taskContainer.innerHTML = `
        <div class="empty-task">
            <div class="empty-icon">_</div>
            <h3>Loading...</h3>
            <p>Mengambil data tugas dari database.</p>
        </div>
    `;


    const { data, error } = await supabaseClient
        .from("tasks")
        .select("*")
        .order("deadline", { ascending: true });


    if (error) {

        console.error("Supabase error:", error);

        taskContainer.innerHTML = `
            <div class="empty-task">
                <div class="empty-icon">!</div>
                <h3>Gagal mengambil data</h3>
                <p>
                    Periksa koneksi Supabase dan konfigurasi API.
                </p>
            </div>
        `;

        return;
    }


    tasks = data || [];

    renderTasks();

    updateStatistics();

}


// =====================================================
// RENDER TASK
// =====================================================

function renderTasks() {

    if (tasks.length === 0) {

        taskContainer.innerHTML = `
            <div class="empty-task">
                <div class="empty-icon">_</div>

                <h3>Belum ada tugas</h3>

                <p>
                    Tambahkan tugas kuliah kamu melalui menu
                    <b>Add / Delete</b>.
                </p>
            </div>
        `;

        return;
    }


    taskContainer.innerHTML = "";


    tasks.forEach(task => {

        const card =
            document.createElement("div");

        card.className = "task-card";


        const deadlineText =
            formatDeadline(task.deadline);


        card.innerHTML = `

            <div class="task-main">

                <h3>
                    ${escapeHTML(task.course)}
                </h3>

                <div class="task-class">
                    CLASS // ${escapeHTML(task.class_name)}
                </div>

                <div class="task-category">
                    ${escapeHTML(task.category)}
                </div>

            </div>


            <div>

                <div class="task-deadline-label">
                    DEADLINE
                </div>

                <div class="task-deadline">
                    ${deadlineText}
                </div>

            </div>


            <div class="task-actions">

                <button
                    class="edit-button"
                    type="button"
                    data-id="${task.id}"
                >
                    EDIT
                </button>

                <button
                    class="delete-button"
                    type="button"
                    data-id="${task.id}"
                >
                    DELETE
                </button>

            </div>

        `;


        // EDIT

        card.querySelector(".edit-button")
            .addEventListener("click", () => {

                editTask(task);

            });


        // DELETE

        card.querySelector(".delete-button")
            .addEventListener("click", () => {

                deleteTask(task.id);

            });


        taskContainer.appendChild(card);

    });

}


// =====================================================
// FORMAT DEADLINE
// =====================================================

function formatDeadline(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(dateString + "T00:00:00");


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// HITUNG "SEGERA"
// =====================================================
//
// Tugas masuk SEGERA jika deadline:
// hari ini sampai maksimal 3 hari ke depan.
//
// Contoh:
// Hari ini 9 September
//
// 9  September -> SEGERA
// 10 September -> SEGERA
// 11 September -> SEGERA
// 12 September -> SEGERA
// 13 September -> tidak
//
// Deadline yang sudah lewat tidak dihitung.
// =====================================================

function isUpcoming(deadlineString) {

    if (!deadlineString) {
        return false;
    }


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const deadline =
        new Date(deadlineString + "T00:00:00");


    deadline.setHours(0, 0, 0, 0);


    const difference =
        Math.round(
            (deadline - today) /
            (1000 * 60 * 60 * 24)
        );


    return difference >= 0 && difference <= 3;

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatistics() {

    totalTasksElement.textContent =
        tasks.length;


    const upcomingTasks =
        tasks.filter(task =>
            isUpcoming(task.deadline)
        );


    upcomingTasksElement.textContent =
        upcomingTasks.length;

}


// =====================================================
// TAMBAH / EDIT TASK
// =====================================================

taskForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const course =
        courseInput.value.trim();

    const className =
        classInput.value.trim();

    const deadline =
        deadlineInput.value;

    const category =
        categoryInput.value;


    if (
        !course ||
        !className ||
        !deadline ||
        !category
    ) {

        alert("Semua data harus diisi.");

        return;

    }


    submitTaskButton.disabled = true;


    // =================================================
    // MODE EDIT
    // =================================================

    if (editingTaskId !== null) {

        const { error } =
            await supabaseClient
                .from("tasks")
                .update({
                    course: course,
                    class_name: className,
                    deadline: deadline,
                    category: category
                })
                .eq("id", editingTaskId);


        if (error) {

            console.error(error);

            alert(
                "Gagal mengubah tugas.\n\n" +
                error.message
            );

            submitTaskButton.disabled = false;

            return;
        }


        alert("Tugas berhasil diubah.");


        editingTaskId = null;


        resetForm();

        showSection("list");

    }


    // =================================================
    // MODE TAMBAH
    // =================================================

    else {

        const { error } =
            await supabaseClient
                .from("tasks")
                .insert({
                    course: course,
                    class_name: className,
                    deadline: deadline,
                    category: category
                });


        if (error) {

            console.error(error);

            alert(
                "Gagal menambahkan tugas.\n\n" +
                error.message
            );

            submitTaskButton.disabled = false;

            return;
        }


        alert("Tugas berhasil ditambahkan.");


        resetForm();

        showSection("list");

    }


    submitTaskButton.disabled = false;

});


// =====================================================
// MULAI MODE TAMBAH
// =====================================================

function startAddMode() {

    editingTaskId = null;

    resetForm();

}


// =====================================================
// EDIT TASK
// =====================================================

function editTask(task) {

    editingTaskId = task.id;


    courseInput.value =
        task.course || "";


    classInput.value =
        task.class_name || "";


    deadlineInput.value =
        task.deadline || "";


    categoryInput.value =
        task.category || "";


    formTitle.textContent =
        "Edit Tugas";


    submitTaskButton.textContent =
        "✓ SIMPAN PERUBAHAN";


    cancelEditButton.classList.remove(
        "hidden"
    );


    showSection("add");

}


// =====================================================
// BATAL EDIT
// =====================================================

cancelEditButton.addEventListener(
    "click",
    () => {

        startAddMode();

        showSection("list");

    }
);


// =====================================================
// RESET FORM
// =====================================================

function resetForm() {

    taskForm.reset();

    editingTaskId = null;


    formTitle.textContent =
        "Tambah Tugas";


    submitTaskButton.textContent =
        "+ TAMBAH TUGAS";


    cancelEditButton.classList.add(
        "hidden"
    );

}


// =====================================================
// DELETE TASK
// =====================================================

async function deleteTask(id) {

    const task =
        tasks.find(item =>
            item.id === id
        );


    if (!task) {
        return;
    }


    const confirmed =
        confirm(
            `Hapus tugas "${task.course}"?`
        );


    if (!confirmed) {
        return;
    }


    const { error } =
        await supabaseClient
            .from("tasks")
            .delete()
            .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Gagal menghapus tugas.\n\n" +
            error.message
        );

        return;
    }


    alert("Tugas berhasil dihapus.");


    loadTasks();

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// INITIAL STATE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        homePage.classList.remove("hidden");

        dashboardPage.classList.add("hidden");

    }
);