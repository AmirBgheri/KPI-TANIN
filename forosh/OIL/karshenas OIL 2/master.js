// ========================================================
// OIL SALES EXPERT DASHBOARD
// ========================================================

const API_URL = "https://6a968499fa33b37f821b50b6.mockapi.io/FOROSH";
const EXPERT_NAME = "کارشناس فروش روغن 2 ";
const TEAM = "OIL";
const CURRENT_YEAR = 1405;
const SALES_HOME_PAGE = "../../sale.index.html";

const MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

let selectedMonthIndex = 0;
let expertRecords = [];
let monthlyTrendChart = null;
let productSalesChart = null;

const $ = (id) => document.getElementById(id);

const headerDate = $("headerDate");
const headerExpertName = $("headerExpertName");
const welcomeText = $("welcomeText");
const selectedMonthLabel = $("selectedMonthLabel");
const prevMonthBtn = $("prevMonthBtn");
const nextMonthBtn = $("nextMonthBtn");
const targetPercentText = $("targetPercentText");
const targetProgress = $("targetProgress");
const salesAmountValue = $("salesAmountValue");
const orderCountValue = $("orderCountValue");
const productCountValue = $("productCountValue");
const profitMarginValue = $("profitMarginValue");
const targetValue = $("targetValue");
const productChartMonth = $("productChartMonth");
const activitiesMonthLabel = $("activitiesMonthLabel");

const activityForm = $("activityForm");
const editingActivityId = $("editingActivityId");
const activityDate = $("activityDate");
const activityType = $("activityType");
const customerInput = $("customerInput");
const productInput = $("productInput");
const salesAmountInput = $("salesAmountInput");
const orderCountInput = $("orderCountInput");
const profitMarginInput = $("profitMarginInput");
const descriptionInput = $("descriptionInput");
const saveActivityBtn = $("saveActivityBtn");
const clearFormBtn = $("clearFormBtn");
const formMessage = $("formMessage");

const showActivitiesBtn = $("showActivitiesBtn");
const activitiesWrapper = $("activitiesWrapper");
const activitiesTableBody = $("activitiesTableBody");
const emptyActivities = $("emptyActivities");
const loadingOverlay = $("loadingOverlay");
const logoutBtn = $("logoutBtn");


document.addEventListener("DOMContentLoaded", initDashboard);

async function initDashboard() {
  headerExpertName.textContent = EXPERT_NAME;
  welcomeText.textContent = `سلام ${EXPERT_NAME}`;
  setHeaderDate();
  selectedMonthIndex = getCurrentPersianMonthIndex();
  setDefaultActivityDate();
  bindEvents();
  await refreshData();
}

function bindEvents() {
  prevMonthBtn.addEventListener("click", () => changeMonth(-1));
  nextMonthBtn.addEventListener("click", () => changeMonth(1));
  activityForm.addEventListener("submit", handleActivitySubmit);
  clearFormBtn.addEventListener("click", clearActivityForm);
  showActivitiesBtn.addEventListener("click", toggleActivities);
  logoutBtn.addEventListener("click", () => window.location.href = SALES_HOME_PAGE);
  // ========================================================
  // SALES AMOUNT LIVE FORMAT
  // ========================================================

  salesAmountInput.addEventListener(
    "input",
    function () {

      salesAmountInput.value =
        formatAmountInput(
          salesAmountInput.value
        );

    }
  );
}

function changeMonth(step) {
  selectedMonthIndex = (selectedMonthIndex + step + 12) % 12;
  loadSelectedMonth();
}

function setHeaderDate() {
  headerDate.textContent = new Date().toLocaleDateString(
    "fa-IR-u-ca-persian",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );
}

function getCurrentPersianMonthIndex() {
  try {
    const monthText = new Intl.DateTimeFormat(
      "fa-IR-u-ca-persian",
      { month: "long" }
    ).format(new Date());

    const index = MONTHS.findIndex(month => monthText.includes(month));
    return index >= 0 ? index : 0;
  } catch {
    return 0;
  }
}

function setDefaultActivityDate() {
  try {
    activityDate.value = new Intl.DateTimeFormat(
      "fa-IR-u-ca-persian-nu-latn",
      { year: "numeric", month: "2-digit", day: "2-digit" }
    ).format(new Date()).replace(/‏/g, "");
  } catch {
    activityDate.value = `${CURRENT_YEAR}/01/01`;
  }
}

async function fetchAllData() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("GET failed");
  return response.json();
}

async function createRecord(body) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error("POST failed");
  return response.json();
}

async function updateRecord(id, body) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error("PUT failed");
  return response.json();
}

async function refreshData() {
  showLoading(true);

  try {
    const data = await fetchAllData();

    expertRecords = data.filter(record =>
      normalizeText(record.NAME) === normalizeText(EXPERT_NAME) &&
      normalizeText(record.TEAM) === normalizeText(TEAM) &&
      Number(record.YEAR) === Number(CURRENT_YEAR)
    );

    loadSelectedMonth();
    renderMonthlyTrendChart();
  } catch (error) {
    console.error(error);
    showMessage("خطا در دریافت اطلاعات از دیتابیس.", "error");
  } finally {
    showLoading(false);
  }
}

function getSelectedMonthName() {
  return MONTHS[selectedMonthIndex];
}

function getSelectedMonthRecord() {
  const month = getSelectedMonthName();
  return expertRecords.find(record =>
    normalizeText(record.MONTH) === normalizeText(month)
  ) || null;
}

function loadSelectedMonth() {
  const month = getSelectedMonthName();
  const record = getSelectedMonthRecord();
  const label = `${month} ${toPersianDigits(CURRENT_YEAR)}`;

  selectedMonthLabel.textContent = label;
  productChartMonth.textContent = label;
  activitiesMonthLabel.textContent = label;

  const activities = getActivities(record);
  const summary = calculateSummary(activities, record);

  renderKpis(summary);
  renderProductChart(activities);

  if (!activitiesWrapper.classList.contains("hidden")) {
    renderActivities(activities);
  }

  clearActivityForm();
}

function getActivities(record) {
  if (!record || record.ACTIVITIES == null) return [];

  if (Array.isArray(record.ACTIVITIES)) return record.ACTIVITIES;

  if (typeof record.ACTIVITIES === "string") {
    try {
      const parsed = JSON.parse(record.ACTIVITIES);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getTarget(record) {
  return record ? Number(record.TARGET || 0) : 0;
}

function calculateSummary(activities, record) {
  const salesAmount = activities.reduce((sum, a) => sum + Number(a.amount || 0), 0);
  const orderCount = activities.reduce((sum, a) => sum + Number(a.orderCount || 0), 0);

  const products = new Set(
    activities
      .map(a => normalizeText(a.product))
      .filter(Boolean)
  );

  const weightedProfit = activities.reduce((sum, a) => {
    return sum + Number(a.amount || 0) * Number(a.profitMargin || 0);
  }, 0);

  const profitMargin = salesAmount > 0 ? weightedProfit / salesAmount : 0;
  const target = getTarget(record);
  const targetPercent = target > 0 ? (salesAmount / target) * 100 : 0;

  return {
    salesAmount,
    orderCount,
    productCount: products.size,
    profitMargin,
    target,
    targetPercent
  };
}

function renderKpis(summary) {
  salesAmountValue.textContent = formatNumber(summary.salesAmount);
  orderCountValue.textContent = formatNumber(summary.orderCount);
  productCountValue.textContent = formatNumber(summary.productCount);
  profitMarginValue.textContent = `${formatDecimal(summary.profitMargin)}٪`;
  targetValue.textContent = formatNumber(summary.target);
  targetPercentText.textContent = `${formatDecimal(summary.targetPercent)}٪`;
  targetProgress.style.width = `${Math.min(Math.max(summary.targetPercent, 0), 100)}%`;
}

async function handleActivitySubmit(event) {
  event.preventDefault();

  const activity = readActivityForm();
  if (!validateActivity(activity)) return;

  showLoading(true);

  try {
    const record = getSelectedMonthRecord();
    let activities = [...getActivities(record)];
    const editId = editingActivityId.value;

    if (editId) {
      activities = activities.map(item =>
        String(item.id) === String(editId)
          ? { ...activity, id: item.id }
          : item
      );
    } else {
      activity.id = createActivityId();
      activities.push(activity);
    }

    const summary = calculateSummary(activities, record);
    const body = buildRecordBody(activities, summary, record);

    if (record) {
      await updateRecord(record.id, body);
    } else {
      await createRecord(body);
    }

    await refreshData();
    activitiesWrapper.classList.remove("hidden");
    showActivitiesBtn.textContent = "بستن فعالیت‌ها";
    renderActivities(getActivities(getSelectedMonthRecord()));
    showMessage(editId ? "فعالیت ویرایش شد." : "فعالیت ثبت شد.", "success");
  } catch (error) {
    console.error(error);
    showMessage("ثبت اطلاعات انجام نشد.", "error");
  } finally {
    showLoading(false);
  }
}

function readActivityForm() {
  return {
    date: activityDate.value.trim(),
    type: activityType.value,
    customer: customerInput.value.trim(),
    product: productInput.value.trim(),
    amount:
      parseAmount(
        salesAmountInput.value
      ),

    orderCount: Number(orderCountInput.value || 0),
    profitMargin: Number(profitMarginInput.value || 0),
    description: descriptionInput.value.trim()
  };
}
/* ========================================================
   PARSE SALES AMOUNT
   تبدیل مبلغ فرمت‌شده به عدد واقعی
======================================================== */

function parseAmount(value) {

  const englishDigits = String(value)

    .replace(/[۰-۹]/g, digit =>
      "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
    )

    .replace(/[٠-٩]/g, digit =>
      "٠١٢٣٤٥٦٧٨٩".indexOf(digit)
    );


  const cleanValue =
    englishDigits.replace(/\D/g, "");


  return Number(cleanValue) || 0;

}
function validateActivity(activity) {
  if (!activity.date) return showValidation("تاریخ فعالیت را وارد کنید.");
  if (!activity.customer) return showValidation("نام مشتری را وارد کنید.");
  if (!activity.product) return showValidation("نام کالا را وارد کنید.");
  if (activity.amount < 0 || activity.orderCount < 0 || activity.profitMargin < 0) {
    return showValidation("مقادیر عددی نمی‌توانند منفی باشند.");
  }
  return true;
}

function showValidation(message) {
  showMessage(message, "error");
  return false;
}

function buildRecordBody(activities, summary, existingRecord) {
  return {
    NAME: EXPERT_NAME,
    TEAM,
    YEAR: CURRENT_YEAR,
    MONTH: getSelectedMonthName(),
    TARGET: getTarget(existingRecord),
    "SALES-AMOUNT": summary.salesAmount,
    "ORDER-COUNT": summary.orderCount,
    "PROFIT-MARGIN": Number(summary.profitMargin.toFixed(2)),
    ACTIVITIES: activities
  };
}

function clearActivityForm() {
  editingActivityId.value = "";
  activityType.value = "فروش";
  customerInput.value = "";
  productInput.value = "";
  salesAmountInput.value = "";
  orderCountInput.value = "";
  profitMarginInput.value = "";
  descriptionInput.value = "";
  saveActivityBtn.textContent = "+ ثبت اطلاعات";
  setDefaultActivityDate();
}

function toggleActivities() {
  const isHidden = activitiesWrapper.classList.contains("hidden");

  if (isHidden) {
    activitiesWrapper.classList.remove("hidden");
    showActivitiesBtn.textContent = "بستن فعالیت‌ها";
    renderActivities(getActivities(getSelectedMonthRecord()));
  } else {
    activitiesWrapper.classList.add("hidden");
    showActivitiesBtn.textContent = "مشاهده فعالیت‌ها";
  }
}

function renderActivities(activities) {
  activitiesTableBody.innerHTML = "";

  if (!activities.length) {
    emptyActivities.classList.remove("hidden");
    return;
  }

  emptyActivities.classList.add("hidden");

  activities.slice().reverse().forEach(activity => {
    const row = document.createElement("tr");
    row.className = "hover:bg-blue-50/40 transition";

    appendCell(row, activity.date || "-");
    appendCell(row, activity.type || "-");
    appendCell(row, activity.customer || "-");
    appendCell(row, activity.product || "-");
    appendCell(row, formatNumber(activity.orderCount || 0));
    appendCell(row, formatNumber(activity.amount || 0));
    appendCell(row, `${formatDecimal(activity.profitMargin || 0)}٪`);
    appendCell(row, activity.description || "-");

    const actionsCell = document.createElement("td");
    actionsCell.className = "px-4 py-3";

    const actions = document.createElement("div");
    actions.className = "flex items-center gap-2";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition";
    editBtn.textContent = "ویرایش";
    editBtn.addEventListener("click", () => editActivity(activity));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition";
    deleteBtn.textContent = "حذف";
    deleteBtn.addEventListener("click", () => deleteActivity(activity.id));

    actions.append(editBtn, deleteBtn);
    actionsCell.appendChild(actions);
    row.appendChild(actionsCell);
    activitiesTableBody.appendChild(row);
  });
}

function appendCell(row, value) {
  const cell = document.createElement("td");
  cell.className = "px-4 py-3 whitespace-nowrap";
  cell.textContent = value;
  row.appendChild(cell);
}

function editActivity(activity) {
  editingActivityId.value = activity.id;
  activityDate.value = activity.date || "";
  activityType.value = activity.type || "فروش";
  customerInput.value = activity.customer || "";
  productInput.value = activity.product || "";
  salesAmountInput.value =
    formatAmount(
        activity.amount || 0
    );
  orderCountInput.value = activity.orderCount || "";
  profitMarginInput.value = activity.profitMargin || "";
  descriptionInput.value = activity.description || "";
  saveActivityBtn.textContent = "ذخیره ویرایش";
  activityForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteActivity(activityId) {
  if (!confirm("این فعالیت حذف شود؟")) return;

  const record = getSelectedMonthRecord();
  if (!record) return;

  showLoading(true);

  try {
    const activities = getActivities(record).filter(
      activity => String(activity.id) !== String(activityId)
    );

    const summary = calculateSummary(activities, record);
    const body = buildRecordBody(activities, summary, record);

    await updateRecord(record.id, body);
    await refreshData();

    activitiesWrapper.classList.remove("hidden");
    showActivitiesBtn.textContent = "بستن فعالیت‌ها";
    renderActivities(getActivities(getSelectedMonthRecord()));
    showMessage("فعالیت حذف شد.", "success");
  } catch (error) {
    console.error(error);
    showMessage("حذف فعالیت انجام نشد.", "error");
  } finally {
    showLoading(false);
  }
}

function renderMonthlyTrendChart() {
  const salesData = MONTHS.map(month => {
    const record = expertRecords.find(r => normalizeText(r.MONTH) === normalizeText(month));
    return calculateSummary(getActivities(record), record).salesAmount;
  });

  const orderData = MONTHS.map(month => {
    const record = expertRecords.find(r => normalizeText(r.MONTH) === normalizeText(month));
    return calculateSummary(getActivities(record), record).orderCount;
  });

  const ctx = $("monthlyTrendChart").getContext("2d");
  if (monthlyTrendChart) monthlyTrendChart.destroy();

  monthlyTrendChart = new Chart(ctx, {
    data: {
      labels: MONTHS,
      datasets: [
        {
          type: "bar",
          label: "مبلغ فروش (میلیون ریال)",
          data: salesData.map(v => v / 1000000),
          backgroundColor: "rgba(5,150,105,.75)",
          borderRadius: 7,
          yAxisID: "y"
        },
        {
          type: "line",
          label: "تعداد سفارش",
          data: orderData,
          borderColor: "#F59E0B",
          backgroundColor: "#F59E0B",
          tension: .3,
          pointRadius: 4,
          yAxisID: "y1"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { position: "top" } },
      scales: {
        y: { beginAtZero: true, position: "left", grid: { color: "#E2E8F0" } },
        y1: { beginAtZero: true, position: "right", grid: { drawOnChartArea: false } }
      }
    }
  });
}

function renderProductChart(activities) {
  const productMap = {};

  activities.forEach(activity => {
    const product = (activity.product || "نامشخص").trim();
    productMap[product] = (productMap[product] || 0) + Number(activity.amount || 0);
  });

  const labels = Object.keys(productMap);
  const values = Object.values(productMap);
  const ctx = $("productSalesChart").getContext("2d");

  if (productSalesChart) productSalesChart.destroy();

  productSalesChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["بدون اطلاعات"],
      datasets: [{
        data: values.length ? values : [1],
        backgroundColor:
          values.length
            ? [
              "#2563EB", // آبی
              "#F59E0B", // طلایی
              "#8B5CF6", // بنفش
              "#10B981", // سبز
              "#EF4444", // قرمز
              "#EC4899", // صورتی
              "#06B6D4", // فیروزه‌ای
              "#F97316", // نارنجی
              "#6366F1", // نیلی
              "#84CC16", // لیمویی
              "#14B8A6", // سبزآبی
              "#A855F7"  // بنفش روشن
            ]
            : ["#E2E8F0"],

        borderColor: "#FFFFFF",
        borderWidth: 3,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "right" } }
    }
  });
}

function showLoading(show) {
  loadingOverlay.classList.toggle("hidden", !show);
  loadingOverlay.classList.toggle("flex", show);
}

function formatAmountInput(value) {

  // تبدیل اعداد فارسی و عربی به انگلیسی
  const englishDigits = String(value)
    .replace(/[۰-۹]/g, digit =>
      "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
    )
    .replace(/[٠-٩]/g, digit =>
      "٠١٢٣٤٥٦٧٨٩".indexOf(digit)
    );

  // حذف ویرگول و سایر کاراکترهای غیرعددی
  const digits = englishDigits.replace(/\D/g, "");

  // جدا کردن هر سه رقم
  return digits.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );
}

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `mt-4 text-sm ${type === "success" ? "text-blue-600" : "text-red-600"}`;
  formMessage.classList.remove("hidden");
  setTimeout(() => formMessage.classList.add("hidden"), 3500);
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function formatDecimal(value) {
  return Number(value || 0).toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

function toPersianDigits(value) {
  return Number(value).toLocaleString("fa-IR", { useGrouping: false });
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function createActivityId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
