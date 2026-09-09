// =========================================================
// TASK VAULT
// SCRIPT.JS
// =========================================================


// =========================================================
// SUPABASE CONFIGURATION
// =========================================================

const SUPABASE_URL =
    "https://ixdwiazefaaajydcohgc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_NowNDOlf5_ysmjIvbUSZXw_esLgw4Eg";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================================================
// DOM ELEMENT
// =========================================================

const homePage =
    document.getElementById("homePage");

const dashboardPage =
    document.getElementById("dashboardPage");

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

const taskContainer =
    document.getElementById("taskContainer");

const emptyTask =
    document.getElementById("emptyTask");


const totalTasks =
    document.getElementById("totalTasks");

const upcomingTasks =
    document.getElementById("upcomingTasks");


// =========================================================
// EDIT MODAL
// =========================================================

const editModal =
    document.getElementById("editModal");

const closeModal =
    document.getElementById("closeModal");

const editForm =
    document.getElementById("editForm");

const editId =
    document.getElementById("editId");

const editCourse =
    document.getElementById("editCourse");

const editClassName =
    document.getElementById("editClassName");

const editDeadline =
    document.getElementById("editDeadline");

const editCategory =
    document.getElementById("editCategory");


// =========================================================
// DATA
// =========================================================

let tasks = [];


// =========================================================
// NAVIGATION
// =========================================================

enterDashboard.addEventListener(
    "click",
    () => {

        homePage.classList.add("hidden");

        dashboardPage.classList.remove("hidden");

        loadTasks();

    }
);


function activateMenu(button) {

    document
        .querySelectorAll(".menu-button")
        .forEach((item) => {

            item.classList.remove("active");

        });

    button.classList.add("active");

}


// LIST TUGAS

listMenu.addEventListener(
    "click",
    () => {

        activateMenu(listMenu);

        taskListSection.classList.remove("hidden");

        scheduleSection.classList.add("hidden");

        addTaskSection.classList.add("hidden");

        loadTasks();

    }
);


// JADWAL

scheduleMenu.addEventListener(
    "click",
    () => {

        activateMenu(scheduleMenu);

        taskListSection.classList.add("hidden");

        scheduleSection.classList.remove("hidden");

        addTaskSection.classList.add("hidden");

        renderSchedule();

    }
);


// ADD / DELETE

addMenu.addEventListener(
    "click",
    () => {

        activateMenu(addMenu);

        taskListSection.classList.add("hidden");

        scheduleSection.classList.add("hidden");

        addTaskSection.classList.remove("hidden");

    }
);


// TOMBOL TAMBAH DARI LIST

addTaskFromList.addEventListener(
    "click",
    () => {

        activateMenu(addMenu);

        taskListSection.classList.add("hidden");

        scheduleSection.classList.add("hidden");

        addTaskSection.classList.remove("hidden");

        document
            .getElementById("course")
            .focus();

    }
);


// =========================================================
// TAMBAH TUGAS
// =========================================================

taskForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const course =
            document
                .getElementById("course")
                .value
                .trim();

        const className =
            document
                .getElementById("className")
                .value
                .trim();

        const deadline =
            document
                .getElementById("deadline")
                .value;

        const category =
            document
                .getElementById("category")
                .value
                .trim();


        if (
            !course ||
            !className ||
            !deadline ||
            !category
        ) {

            alert("Semua data harus diisi.");

            return;

        }


        const {
            error
        } = await supabaseClient
            .from("tasks")
            .insert([
                {
                    course: course,
                    class_name: className,
                    deadline: deadline,
                    category: category
                }
            ]);


        if (error) {

            console.error(error);

            alert(
                "Gagal menambahkan tugas:\n\n" +
                error.message
            );

            return;

        }


        alert("Tugas berhasil ditambahkan.");


        taskForm.reset();


        activateMenu(listMenu);

        taskListSection.classList.remove("hidden");

        addTaskSection.classList.add("hidden");

        await loadTasks();

    }
);


// =========================================================
// LOAD TASKS
// =========================================================

async function loadTasks() {

    taskContainer.innerHTML = "";

    taskContainer.appendChild(emptyTask);


    const {
        data,
        error
    } = await supabaseClient
        .from("tasks")
        .select("*")
        .order("deadline", {
            ascending: true
        });


    if (error) {

        console.error(error);

        taskContainer.innerHTML = `
            <div class="empty-task">
                <div class="empty-icon">!</div>
                <h3>Gagal mengambil data</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>
        `;

        return;

    }


    tasks = data || [];


    updateStatistics();

    renderTasks();

}


// =========================================================
// RENDER TASK
// =========================================================

function renderTasks() {

    taskContainer.innerHTML = "";


    if (tasks.length === 0) {

        taskContainer.appendChild(emptyTask);

        return;

    }


    tasks.forEach((task) => {

        const card =
            createTaskCard(task);

        taskContainer.appendChild(card);

    });

}


// =========================================================
// CREATE TASK CARD
// =========================================================

function createTaskCard(task) {

    const card =
        document.createElement("div");

    card.className = "task-card";


    const deadlineInfo =
        getDeadlineInfo(task.deadline);


    card.innerHTML = `

        <div class="task-info">

            <div class="task-label">
                TASK
            </div>

            <h3>
                ${escapeHtml(task.course)}
            </h3>

            <div class="task-class">
                CLASS // ${escapeHtml(task.class_name)}
            </div>

            <div class="category-badge">
                ${escapeHtml(task.category)}
            </div>

        </div>


        <div class="task-deadline">

            <div class="deadline-label">
                DEADLINE
            </div>

            <div class="deadline-date">
                ${formatDate(task.deadline)}
            </div>

            <div class="deadline-warning ${
                deadlineInfo.overdue
                    ? "overdue"
                    : ""
            }">

                ${deadlineInfo.text}

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


    const editButton =
        card.querySelector(".edit-button");

    const deleteButton =
        card.querySelector(".delete-button");


    editButton.addEventListener(
        "click",
        () => {

            openEditModal(task);

        }
    );


    deleteButton.addEventListener(
        "click",
        () => {

            deleteTask(task.id);

        }
    );


    return card;

}


// =========================================================
// EDIT TASK
// =========================================================

function openEditModal(task) {

    editId.value =
        task.id;

    editCourse.value =
        task.course || "";

    editClassName.value =
        task.class_name || "";

    editDeadline.value =
        task.deadline || "";

    editCategory.value =
        task.category || "";


    editModal.classList.remove("hidden");

}


function closeEditModal() {

    editModal.classList.add("hidden");

}


closeModal.addEventListener(
    "click",
    closeEditModal
);


editModal.addEventListener(
    "click",
    (event) => {

        if (event.target === editModal) {

            closeEditModal();

        }

    }
);


// =========================================================
// SIMPAN EDIT
// =========================================================

editForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const id =
            editId.value;

        const course =
            editCourse.value.trim();

        const className =
            editClassName.value.trim();

        const deadline =
            editDeadline.value;

        const category =
            editCategory.value.trim();


        if (
            !id ||
            !course ||
            !className ||
            !deadline ||
            !category
        ) {

            alert(
                "Semua data harus diisi."
            );

            return;

        }


        const {
            error
        } = await supabaseClient
            .from("tasks")
            .update({
                course: course,
                class_name: className,
                deadline: deadline,
                category: category
            })
            .eq("id", id);


        if (error) {

            console.error(error);

            alert(
                "Gagal mengubah tugas:\n\n" +
                error.message
            );

            return;

        }


        alert(
            "Tugas berhasil diperbarui."
        );


        closeEditModal();

        await loadTasks();

    }
);


// =========================================================
// DELETE TASK
// =========================================================

async function deleteTask(id) {

    const confirmation =
        confirm(
            "Yakin ingin menghapus tugas ini?"
        );


    if (!confirmation) {

        return;

    }


    const {
        error
    } = await supabaseClient
        .from("tasks")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Gagal menghapus tugas:\n\n" +
            error.message
        );

        return;

    }


    alert(
        "Tugas berhasil dihapus."
    );


    await loadTasks();

}


// =========================================================
// STATISTICS
// =========================================================

function updateStatistics() {

    totalTasks.textContent =
        tasks.length;


    const upcoming =
        tasks.filter((task) => {

            return isWithinThreeDays(
                task.deadline
            );

        });


    upcomingTasks.textContent =
        upcoming.length;

}


// =========================================================
// DEADLINE ≤ 3 HARI
// =========================================================

function isWithinThreeDays(deadline) {

    if (!deadline) {

        return false;

    }


    const today =
        startOfDay(
            new Date()
        );


    const target =
        startOfDay(
            new Date(
                deadline + "T00:00:00"
            )
        );


    const difference =
        target - today;


    const days =
        Math.round(
            difference /
            (1000 * 60 * 60 * 24)
        );


    return days >= 0 && days <= 3;

}


function getDeadlineInfo(deadline) {

    const today =
        startOfDay(
            new Date()
        );


    const target =
        startOfDay(
            new Date(
                deadline + "T00:00:00"
            )
        );


    const difference =
        target - today;


    const days =
        Math.round(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (days < 0) {

        return {
            text:
                `TERLAMBAT ${Math.abs(days)} HARI`,
            overdue: true
        };

    }


    if (days === 0) {

        return {
            text: "HARI INI",
            overdue: false
        };

    }


    if (days === 1) {

        return {
            text: "TERSISA 1 HARI",
            overdue: false
        };

    }


    if (days <= 3) {

        return {
            text:
                `TERSISA ${days} HARI`,
            overdue: false
        };

    }


    return {
        text:
            `TERSISA ${days} HARI`,
        overdue: false
    };

}


function startOfDay(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

}


// =========================================================
// FORMAT TANGGAL
// =========================================================

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


// =========================================================
// JADWAL DARI EXCEL
// =========================================================

const scheduleData = [

    {
        hari: "Senin",
        jam: "09.20–12.00",
        mataKuliah: "Kapita Selekta",
        kelas: "RD",
        sks: "3",
        dosen: "Raidah Hanifah, S.T., M.T.",
        ruang: "GK2 207"
    },

    {
        hari: "Senin",
        jam: "13.00–15.40",
        mataKuliah: "Inteligensi Buatan",
        kelas: "RA",
        sks: "3",
        dosen: "Rahman Indra Kesuma, S.Kom., M.Cs.",
        ruang: "GK2 123"
    },

    {
        hari: "Selasa",
        jam: "13.00–15.40",
        mataKuliah: "Keamanan Siber",
        kelas: "R",
        sks: "3",
        dosen: "Sarwono Sutikno, Dr.Eng., CISA, CISSP, CISM",
        ruang: "Labtek 3, Lantai 3, Lab IOT"
    },

    {
        hari: "Rabu",
        jam: "09.20-11.50",
        mataKuliah: "Karier, Etika, & Kewirausahaan",
        kelas: "R47IF",
        sks: "2",
        dosen: "Bagus Aryatama M.OR",
        ruang: "F001"
    },

    {
        hari: "Rabu",
        jam: "15.00-17.30",
        mataKuliah: "Kriptografi",
        kelas: "R",
        sks: "3",
        dosen: "King Angga Wijaya",
        ruang: "GK2 318"
    },

    {
        hari: "Kamis",
        jam: "13.00–15.40",
        mataKuliah: "Metodologi Penelitian",
        kelas: "RD",
        sks: "3",
        dosen: "Alya Khairunnisa Rizkita, S.Kom., M.Kom.",
        ruang: "GK2 224"
    },

    {
        hari: "Jumat",
        jam: "09.20-11.05",
        mataKuliah: "Sistem Informasi",
        kelas: "RD",
        sks: "2",
        dosen: "Miranti Verdiana, M.Si.",
        ruang: "GK2 305"
    },

    {
        hari: "Jumat",
        jam: "13.00-15.40",
        mataKuliah: "Jaringan Komputer",
        kelas: "RC",
        sks: "3",
        dosen: "Ilham Firman Ashari, S.Kom., M.T.",
        ruang: "GK2 303"
    }

];


function renderSchedule() {

    const scheduleBody =
        document.getElementById(
            "scheduleBody"
        );


    scheduleBody.innerHTML = "";


    scheduleData.forEach(
        (item) => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(item.hari)}
                </td>

                <td>
                    ${escapeHtml(item.jam)}
                </td>

                <td>
                    ${escapeHtml(item.mataKuliah)}
                </td>

                <td>
                    ${escapeHtml(item.kelas)}
                </td>

                <td>
                    ${escapeHtml(item.sks)}
                </td>

                <td>
                    ${escapeHtml(item.dosen)}
                </td>

                <td>
                    ${escapeHtml(item.ruang)}
                </td>

            `;


            scheduleBody.appendChild(row);

        }
    );

}


// =========================================================
// SECURITY
// =========================================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================================================
// INIT
// =========================================================

renderSchedule();