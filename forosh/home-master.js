// SALES KPI - DYNAMIC EXPERTS

const dateElement = document.querySelector("#date");
const today = new Date();

if (dateElement) {
    dateElement.textContent = today.toLocaleDateString(
        "fa-IR",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


// ========================================================
// MANAGEMENT
// ========================================================

// حساب مدیر و هر سه بخش از فهرست مرکزی مشترک دریافت می‌شوند.
// برای اضافه کردن کارشناس فقط sales-users.js را تغییر بده.
const directory = window.SALES_DIRECTORY;
if (!directory) throw new Error("sales-users.js باید قبل از master.js بارگذاری شود.");
const managementAccount = directory.management;
const salesSections = Object.fromEntries(
    Object.entries(directory.sections).map(([key, section]) => [
        key,
        { ...section, experts: directory.users.filter(user => user.team === section.team) }
    ])
);


// ========================================================
// ELEMENTS
// ========================================================

const cards = document.querySelector("#cards");
const usersSection = document.querySelector("#users");
const back = document.querySelector("#back");

const usersTitle = usersSection ? usersSection.querySelector("h2") : null;
const usersSubtitle = usersSection ? usersSection.querySelector("p") : null;
const usersGrid = usersSection ? usersSection.querySelector(".grid") : null;

const passwordModal = document.querySelector("#passwordModal");
const passwordBox = document.querySelector("#passwordBox");
const passwordInput = document.querySelector("#passwordInput");
const passwordError = document.querySelector("#passwordError");
const selectedUser = document.querySelector("#selectedUser");
const loginButton = document.querySelector("#loginButton");
const cancelButton = document.querySelector("#cancelButton");

let selectedAccount = null;


// ========================================================
// FIND MAIN CARD BY TITLE
// ========================================================

function findMainCardByTitle(title) {
    if (!cards) return null;

    const buttons = Array.from(cards.children)
        .filter(element => element.tagName === "BUTTON");

    return buttons.find(button => {
        const heading = button.querySelector("h3");
        return heading && heading.textContent.trim() === title;
    });
}

const managementCard = findMainCardByTitle("مدیریت فروش");
const oilCard = findMainCardByTitle("روغن");
const computerCard = findMainCardByTitle("کارشناسان کامپیوتر");
const estelamCard = findMainCardByTitle("کارشناسان استعلام");


// ========================================================
// CREATE EXPERT CARD
// ========================================================

function createExpertCard(expert, section) {

    const button = document.createElement("button");

    button.type = "button";

    button.className = `
        user-card
        bg-white
        p-7
        rounded-2xl
        border
        border-slate-200
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
        text-right
    `;

    const mainDiv = document.createElement("div");
    mainDiv.className = "flex items-center gap-4";

    const avatar = document.createElement("div");
    avatar.className = `
        w-14
        h-14
        rounded-full
        flex
        items-center
        justify-center
        font-bold
        text-lg
        ${section.avatarClass}
    `;
    avatar.textContent = expert.initials;

    const textContainer = document.createElement("div");

    const name = document.createElement("h3");
    name.className = "font-bold text-lg";
    name.textContent = expert.name;

    const role = document.createElement("p");
    role.className = "text-sm text-slate-500 mt-1";
    role.textContent = expert.role;

    textContainer.appendChild(name);
    textContainer.appendChild(role);

    mainDiv.appendChild(avatar);
    mainDiv.appendChild(textContainer);

    button.appendChild(mainDiv);

    button.addEventListener("click", function () {
        selectedAccount = expert;
        openPasswordModal(expert.name);
    });

    return button;
}


// ========================================================
// RENDER EXPERTS
// ========================================================

function renderExperts(sectionKey) {

    const section = salesSections[sectionKey];

    if (!section || !usersGrid) return;

    if (usersTitle) {
        usersTitle.textContent = section.title;
    }

    if (usersSubtitle) {
        usersSubtitle.textContent = section.subtitle;
    }

    usersGrid.innerHTML = "";

    section.experts.forEach(expert => {

        const card = createExpertCard(
            expert,
            section
        );

        usersGrid.appendChild(card);
    });
}


// ========================================================
// SHOW EXPERTS
// ========================================================

function showExperts(sectionKey) {

    renderExperts(sectionKey);

    cards.classList.add(
        "opacity-0",
        "-translate-x-10"
    );

    setTimeout(function () {

        cards.classList.add("hidden");

        usersSection.classList.remove("hidden");

        setTimeout(function () {

            usersSection.classList.remove(
                "opacity-0",
                "translate-x-10"
            );

        }, 50);

    }, 500);
}


// ========================================================
// MAIN CARD EVENTS
// ========================================================

if (oilCard) {
    oilCard.addEventListener("click", function () {
        showExperts("oil");
    });
}

if (computerCard) {
    computerCard.addEventListener("click", function () {
        showExperts("computer");
    });
}

if (estelamCard) {
    estelamCard.addEventListener("click", function () {
        showExperts("estelam");
    });
}

if (managementCard) {
    managementCard.addEventListener("click", function () {
        selectedAccount = managementAccount;
        openPasswordModal(managementAccount.name);
    });
}


// ========================================================
// BACK
// ========================================================

if (back) {
    back.addEventListener("click", function () {

        usersSection.classList.add(
            "opacity-0",
            "translate-x-10"
        );

        setTimeout(function () {

            usersSection.classList.add("hidden");
            cards.classList.remove("hidden");

            setTimeout(function () {

                cards.classList.remove(
                    "opacity-0",
                    "-translate-x-10"
                );

            }, 50);

        }, 500);
    });
}


// ========================================================
// OPEN MODAL
// ========================================================

function openPasswordModal(displayName) {

    if (!passwordModal || !passwordBox) return;

    if (selectedUser) {
        selectedUser.textContent = displayName;
    }

    passwordInput.value = "";

    passwordError.classList.add("hidden");
    passwordInput.classList.remove("border-red-500");

    passwordModal.classList.remove("hidden");
    passwordModal.classList.add("flex");

    setTimeout(function () {

        passwordModal.classList.remove("opacity-0");

        passwordBox.classList.remove("scale-95");
        passwordBox.classList.add("scale-100");

        passwordInput.focus();

    }, 50);
}


// ========================================================
// LOGIN
// ========================================================

function login() {

    if (!selectedAccount) return;

    const enteredPassword =
        passwordInput.value;

    if (
        enteredPassword ===
        selectedAccount.password
    ) {

        window.location.href =
            selectedAccount.page;

        return;
    }

    passwordError.classList.remove("hidden");
    passwordInput.classList.add("border-red-500");
    passwordInput.focus();
}


// ========================================================
// MODAL EVENTS
// ========================================================

if (loginButton) {
    loginButton.addEventListener(
        "click",
        login
    );
}

if (passwordInput) {
    passwordInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                login();
            }
        }
    );
}

if (cancelButton) {
    cancelButton.addEventListener(
        "click",
        closePasswordModal
    );
}

if (passwordModal) {
    passwordModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                passwordModal
            ) {
                closePasswordModal();
            }
        }
    );
}

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            passwordModal &&
            !passwordModal.classList.contains("hidden")
        ) {
            closePasswordModal();
        }
    }
);


// ========================================================
// CLOSE MODAL
// ========================================================

function closePasswordModal() {

    if (!passwordModal || !passwordBox) return;

    passwordModal.classList.add("opacity-0");

    passwordBox.classList.remove("scale-100");
    passwordBox.classList.add("scale-95");

    setTimeout(function () {

        passwordModal.classList.add("hidden");
        passwordModal.classList.remove("flex");

        passwordInput.value = "";

        passwordError.classList.add("hidden");
        passwordInput.classList.remove("border-red-500");

        selectedAccount = null;

    }, 300);
}
