/* ====================================================================
  مدیریت فروش طنین | FOROSH + BAZARGANI
  ایده اصلی:
  - تعداد کارشناسان در این فایل ثابت نیست؛ از sales-users.js و API کشف می‌شود.
  - هر رکورد FOROSH = نام + تیم + سال + ماه، و ACTIVITIES آرایه آن ماه است.
  - تارگت فقط در TARGET همان رکورد ذخیره می‌شود؛ سایر فیلدها دست‌نخورده می‌مانند.
  - کارشناسان استعلام از Resource بازرگانی فقط خوانده می‌شوند، نه جمع با مبلغ فروش.
 ==================================================================== */
const SALES_API = "https://6a968499fa33b37f821b50b6.mockapi.io/FOROSH";
const BAZARGANI_API = "https://6a968499fa33b37f821b50b6.mockapi.io/BAZARGANI-Amirbagheri";
const SCHEMA_STYLE = "hyphen"; // اگر در MockAPI از SALES_AMOUNT استفاده کردی: "underscore"
const MONTHS = ["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const TEAM_NAMES = {OIL:"فروش روغن", COMPUTER:"فروش کامپیوتر"};
const TEAM_COLORS = {OIL:"#16A34A", COMPUTER:"#2563EB"};
const el = id => document.getElementById(id);
const fmt = n => Number(n || 0).toLocaleString("fa-IR", {maximumFractionDigits: 1});
const num = n => Number(n || 0);
const text = s => String(s ?? "").trim().replace(/ي/g,"ی").replace(/ك/g,"ک");
const key = (name,team) => `${text(team).toUpperCase()}|${text(name)}`;
const cleanNumber = v => Number(String(v ?? "").replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^0-9]/g,"")) || 0;
const digits = v => String(v ?? "").replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g,"");
const moneyInput = v => digits(v).replace(/\B(?=(\d{3})+(?!\d))/g,",");
const salesField = kind => SCHEMA_STYLE === "underscore" ? (kind === "sales" ? "SALES_AMOUNT" : kind === "orders" ? "ORDER_COUNT" : "PROFIT_MARGIN") : (kind === "sales" ? "SALES-AMOUNT" : kind === "orders" ? "ORDER-COUNT" : "PROFIT-MARGIN");
const getField = (record,kind) => kind === "sales" ? num(record?.["SALES-AMOUNT"] ?? record?.SALES_AMOUNT) : kind === "orders" ? num(record?.["ORDER-COUNT"] ?? record?.ORDER_COUNT) : num(record?.["PROFIT-MARGIN"] ?? record?.PROFIT_MARGIN);

let salesRecords = [];
let bazarganiRecords = [];
let registryUsers = [];
let allSalesUsers = [];
let chartTeams = null;
let chartTrend = null;
let showAllActivities = false;
let reportMonth = "فروردین";
let reportYear = 1405;
let loaded = false;

/* 1) وقتی صفحه آماده شد، انتخاب‌ها و رویدادها را وصل می‌کنیم. */
document.addEventListener("DOMContentLoaded", initialize);
function initialize() {
  if (!window.SALES_DIRECTORY) {
    showGlobal("فایل sales-users.js بارگذاری نشده است؛ فهرست کاربران را بررسی کنید.",true);
    return;
  }
  registryUsers = window.SALES_DIRECTORY.users.filter(u => ["OIL","COMPUTER"].includes(u.team));
  const today = new Date();
  el("todayLabel").textContent = today.toLocaleDateString("fa-IR-u-ca-persian", {weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const parts = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn",{year:"numeric",month:"numeric"}).formatToParts(today);
  reportYear = Number(parts.find(p=>p.type === "year")?.value) || 1405;
  const currentIndex = Number(parts.find(p=>p.type === "month")?.value) - 1;
  reportMonth = MONTHS[Math.max(0,currentIndex)] || "فروردین";
  el("reportYear").value = reportYear;
  for (const id of ["reportMonth","targetMonth"]) {
    MONTHS.forEach(m => el(id).add(new Option(m,m)));
    el(id).value = reportMonth;
  }
  el("targetAmount").addEventListener("input", e => {e.target.value = moneyInput(e.target.value); renderTargetPreview();});
  el("targetTeam").addEventListener("change", () => {fillTargetExperts(); renderTargetPanel();});
  el("targetMonth").addEventListener("change",renderTargetPanel);
  el("targetExpert").addEventListener("change",renderTargetPreview);
  el("targetForm").addEventListener("submit",saveTarget);
  el("expertFilter").addEventListener("change",renderExpertCards);
  el("refreshBtn").addEventListener("click",refresh);
  el("moreActivities").addEventListener("click", () => {showAllActivities = !showAllActivities; renderActivities();});
  refresh();
}

/* 2) خواندن هر دو Resource؛ خطای استعلام نباید فروش را از کار بیندازد. */
async function getJson(url) {
  const response = await fetch(url,{cache:"no-store"});
  if (!response.ok) throw new Error(`HTTP ${response.status} | ${url}`);
  const result = await response.json();
  if (!Array.isArray(result)) throw new Error("پاسخ API آرایه نیست");
  return result;
}
async function refresh() {
  el("refreshBtn").disabled = true;
  el("refreshBtn").textContent = "در حال دریافت…";
  try {
    salesRecords = await getJson(SALES_API);
    loaded = true;
    allSalesUsers = discoverUsers();
    showGlobal("اطلاعات فروش دریافت شد.",false);
    renderDashboard();
    try {
    
      ;
    } catch(err) {
      console.error(err);
      el("inquirySummary").textContent = "اتصال به Resource بازرگانی برقرار نشد؛ آدرس BAZARGANI_API را بررسی کنید.";
      el("inquiryExperts").replaceChildren();
    }
  } catch (err) {
    console.error(err);
    showGlobal("اتصال به FOROSH برقرار نشد. آدرس API و اینترنت را بررسی کنید؛ هیچ تارگتی ذخیره نشده است.",true);
  } finally {
    el("refreshBtn").disabled = false;
    el("refreshBtn").textContent = "بروزرسانی ↻";
  }
}

/* 3) فهرست کارشناس = فهرست مشترک برنامه + هر نام جدیدی که از API پیدا شود.
      برای کارشناس ثبت‌نام‌شده بدون هیچ فروش هم کارت ساخته می‌شود. */
function discoverUsers() {
  const users = new Map();
  for (const user of registryUsers) users.set(key(user.name,user.team),{...user});
  for (const r of salesRecords) {
    const team = text(r.TEAM).toUpperCase();
    if (!["OIL","COMPUTER"].includes(team) || !text(r.NAME)) continue;
    const id = key(r.NAME,team);
    if (!users.has(id)) users.set(id,{name:text(r.NAME),team,role:`کارشناس ${TEAM_NAMES[team]}`,page:"",id:`api-${r.id}`});
  }
  return Array.from(users.values());
}
function monthRecord(user, month=reportMonth, year=reportYear) {
  return salesRecords.find(r => key(r.NAME,r.TEAM) === key(user.name,user.team) && num(r.YEAR) === num(year) && text(r.MONTH) === text(month)) || null;
}
function activitiesOf(record) {
  if (!record) return [];
  if (Array.isArray(record.ACTIVITIES)) return record.ACTIVITIES;
  if (typeof record.ACTIVITIES === "string") {try {const a=JSON.parse(record.ACTIVITIES);return Array.isArray(a)?a:[];}catch {return [];}}
  return [];
}
/* فعالیت‌های فروش، منبع اصلی محاسبه است؛ برای رکوردهای قدیمی خالی از فیلد جمع‌شده استفاده می‌کنیم. */
function summary(record) {
  const a = activitiesOf(record);
  const sales = a.length ? a.reduce((s,x)=>s+num(x.amount),0) : getField(record,"sales");
  const orders = a.length ? a.reduce((s,x)=>s+num(x.orderCount),0) : getField(record,"orders");
  const profit = a.length && sales > 0 ? a.reduce((s,x)=>s+num(x.amount)*num(x.profitMargin),0)/sales : getField(record,"profit");
  return {sales,orders,profit,target:num(record?.TARGET),activities:a};
}
function allMonthRows() {return allSalesUsers.map(u=>({user:u,record:monthRecord(u),s:summary(monthRecord(u))}));}
function progress(s) {return s.target>0 ? s.sales/s.target*100 : null;}
const pct = s => progress(s)===null ? "تارگت تعیین نشده" : `${fmt(progress(s))}٪`;
function td(row,value,classes="") {const cell=document.createElement("td");cell.className=`p-3 ${classes}`;cell.textContent=String(value);row.appendChild(cell);return cell;}
function box(tag,cls,value) {const x=document.createElement(tag);x.className=cls;if(value!=null)x.textContent=String(value);return x;}
function showGlobal(message,error) {const x=el("globalMessage");x.textContent=message;x.className=`rounded-xl mt-4 p-3 text-sm ${error?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-700"}`;}
function showTargetMessage(message,error) {const x=el("targetMessage");x.textContent=message;x.className=`rounded-lg p-3 text-sm ${error?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-700"}`;}

/* 4) بازسازی همه قسمت‌های مدیریت با تغییر ماه و سال. */
function renderDashboard() {
  if (!loaded) return;
  allSalesUsers = discoverUsers();
  const rows = allMonthRows();
  const sales=rows.reduce((s,r)=>s+r.s.sales,0);
  const orders=rows.reduce((s,r)=>s+r.s.orders,0);
  const target=rows.reduce((s,r)=>s+r.s.target,0);
  el("kSales").textContent=fmt(sales);
  el("kOrders").textContent=fmt(orders);
  el("kExperts").textContent=fmt(allSalesUsers.length);
  el("kTarget").textContent=fmt(target);
  el("kProgress").textContent=target>0?`${fmt(sales/target*100)}٪`:"—";
  el("kProgressBar").style.width=`${target>0?Math.min(100,sales/target*100):0}%`;
  fillTargetExperts();
  renderTargetPanel();
  renderTeams(rows);
  renderExpertCards();
  renderTrend();
  renderActivities();
}

/* 5) فرم مدیریت تارگت: فقط OIL و COMPUTER، از فهرست پویا. */
function fillTargetExperts() {
  const select=el("targetExpert"), previous=select.value;
  const team=el("targetTeam").value;
  const list=allSalesUsers.filter(u=>u.team===team);
  select.replaceChildren();
  for(const u of list) select.add(new Option(u.name,key(u.name,u.team)));
  if(list.some(u=>key(u.name,u.team)===previous)) select.value=previous;
  el("saveTarget").disabled=!list.length || !loaded;
}
function chosenUser() {return allSalesUsers.find(u=>key(u.name,u.team)===el("targetExpert").value && u.team===el("targetTeam").value) || null;}
function renderTargetPreview() {
  const u=chosenUser();
  const s=summary(u ? monthRecord(u,el("targetMonth").value,reportYear) : null);
  const proposed=cleanNumber(el("targetAmount").value);
  el("selectedSales").textContent=`${fmt(s.sales)} ریال`;
  el("selectedTarget").textContent=s.target?`${fmt(s.target)} ریال`:"ثبت نشده";
  el("selectedPercent").textContent=proposed>0?`${fmt(s.sales/proposed*100)}٪`:"—";
  el("selectedBar").style.width=`${proposed>0?Math.min(100,s.sales/proposed*100):0}%`;
}
function renderTargetPanel() {
  const u=chosenUser();
  const r=u?monthRecord(u,el("targetMonth").value,reportYear):null;
  el("targetAmount").value=moneyInput(r?.TARGET ?? 0);
  renderTargetPreview();
  renderTargetTable();
}
function renderTargetTable() {
  const table=el("targetTable");table.replaceChildren();
  const team=el("targetTeam").value,month=el("targetMonth").value;
  const list=allSalesUsers.filter(u=>u.team===team);
  if(!list.length){const tr=box("tr","");td(tr,"در این تیم هنوز کارشناسی وجود ندارد.").colSpan=5;table.appendChild(tr);return;}
  for(const u of list){
    const s=summary(monthRecord(u,month,reportYear));
    const tr=box("tr","hover:bg-slate-50");
    td(tr,u.name,"font-semibold");td(tr,s.target?fmt(s.target):"ثبت نشده");td(tr,fmt(s.sales));td(tr,pct(s));
    const action=box("td","p-3"), b=box("button","bg-blue-50 text-blue-700 rounded-lg px-3 py-1.5","ویرایش");b.type="button";
    b.addEventListener("click",()=>{el("targetExpert").value=key(u.name,u.team);renderTargetPreview();el("targetAmount").value=moneyInput(s.target);renderTargetPreview();el("targetAmount").focus();});
    action.appendChild(b);tr.appendChild(action);table.appendChild(tr);
  }
}

/* 6) ذخیره امن‌تر تارگت: GET مجدد از API، سپس PUT فقط با تغییر TARGET.
   اگر ماه وجود نداشت POST یک رکورد ماهانه ایجاد می‌کند.
   محدودیت 100 رکورد مربوط به تعداد ماه‌ها است، نه تعداد فعالیت‌ها. */
async function saveTarget(event) {
  event.preventDefault();
  const u=chosenUser();
  if(!u) return showTargetMessage("کارشناس را انتخاب کنید.",true);
  const raw=digits(el("targetAmount").value);
  if(!raw) return showTargetMessage("مبلغ تارگت را وارد کنید.",true);
  const amount=Number(raw);
  if(!Number.isSafeInteger(amount)||amount<=0) return showTargetMessage("تارگت باید عدد صحیح و بزرگ‌تر از صفر باشد.",true);
  const btn=el("saveTarget");btn.disabled=true;btn.textContent="در حال ذخیره…";
  try {
    const latest=await getJson(SALES_API);
    const matching=latest.filter(r=>key(r.NAME,r.TEAM)===key(u.name,u.team) && num(r.YEAR)===reportYear && text(r.MONTH)===text(el("targetMonth").value));
    if(matching.length>1) throw new Error("برای این کارشناس و ماه چند رکورد تکراری وجود دارد؛ قبل از تعیین تارگت اصلاحشان کنید.");
    let response;
    if(matching.length){
      // همه فعالیت‌ها و محاسبات موجود بدون تغییر باقی می‌مانند.
      const original=matching[0];
      response=await fetch(`${SALES_API}/${encodeURIComponent(original.id)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...original,TARGET:amount})});
    } else {
      const fresh={NAME:u.name,TEAM:u.team,YEAR:reportYear,MONTH:el("targetMonth").value,TARGET:amount,ACTIVITIES:[]};
      fresh[salesField("sales")]=0;fresh[salesField("orders")]=0;fresh[salesField("profit")]=0;
      response=await fetch(SALES_API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fresh)});
    }
    if(!response.ok) throw new Error(`ذخیره ناموفق: HTTP ${response.status}`);
    salesRecords=await getJson(SALES_API);
    allSalesUsers=discoverUsers();
    renderDashboard();
    showTargetMessage(`تارگت ${u.name} برای ${el("targetMonth").value} ${fmt(reportYear)} ذخیره شد؛ کارتابل کارشناس پس از دریافت مجدد API مقدار جدید را نمایش می‌دهد.`,false);
  }catch(err){console.error(err);showTargetMessage(err.message||"خطا در ذخیره تارگت",true);}
  finally{btn.disabled=false;btn.textContent="ذخیره تارگت کارشناس";}
}

/* 7) مقایسه دو تیم فروش؛ نمودار و کارت‌های سمت آن از رکوردهای ماه ساخته می‌شوند. */
function renderTeams(rows) {
  const results=["OIL","COMPUTER"].map(team=>{
    const list=rows.filter(r=>r.user.team===team);
    return {team,sales:list.reduce((s,r)=>s+r.s.sales,0),target:list.reduce((s,r)=>s+r.s.target,0),experts:list.length,orders:list.reduce((s,r)=>s+r.s.orders,0)};
  });
  const summaryBox=el("teamSummary");summaryBox.replaceChildren();
  for(const t of results){
    const card=box("div","rounded-2xl border border-slate-200 p-4 bg-slate-50");
    const head=box("div","flex justify-between items-center gap-2 font-bold");
    head.append(box("span","",TEAM_NAMES[t.team]),box("span","text-sm",`${t.experts.toLocaleString("fa-IR")} نفر`));
    card.append(head,box("p","text-xl font-bold mt-3",`${fmt(t.sales)} ریال`),box("p","text-xs text-slate-500 mt-2",`تارگت ${fmt(t.target)} ریال | تحقق ${t.target>0?fmt(t.sales/t.target*100)+"٪":"تعیین نشده"}`));
    const track=box("div","mt-3 h-2 bg-slate-200 rounded-full overflow-hidden");
    const fill=box("div","h-full rounded-full");fill.style.width=`${t.target?Math.min(100,t.sales/t.target*100):0}%`;fill.style.backgroundColor=TEAM_COLORS[t.team];track.appendChild(fill);card.appendChild(track);summaryBox.appendChild(card);
  }
  if(typeof Chart!=="function")return;
  if(chartTeams)chartTeams.destroy();
  chartTeams=new Chart(el("teamChart"),{type:"bar",data:{labels:results.map(t=>TEAM_NAMES[t.team]),datasets:[{label:"فروش (میلیون ریال)",data:results.map(t=>t.sales/1e6),backgroundColor:results.map(t=>TEAM_COLORS[t.team]),borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
}

/* 8) کارشناس‌ها با createElement؛ نه کارت هاردکد و نه تعداد ثابت. */
function renderExpertCards() {
  const cards=el("expertCards");cards.replaceChildren();
  const list=allSalesUsers.filter(u=>el("expertFilter").value==="ALL"||u.team===el("expertFilter").value);
  if(!list.length){cards.appendChild(box("p","text-slate-500 p-5","کارشناسی در فهرست وجود ندارد."));return;}
  for(const u of list){
    const s=summary(monthRecord(u));
    const isOil=u.team==="OIL";
    const card=box("article","border border-slate-200 rounded-2xl overflow-hidden bg-white");
    const heading=box("div",`p-4 flex items-center justify-between ${isOil?"bg-emerald-50":"bg-blue-50"}`);
    heading.appendChild(box("strong",isOil?"text-emerald-700":"text-blue-700",u.name));heading.appendChild(box("span","text-xs text-slate-500",TEAM_NAMES[u.team]));card.appendChild(heading);
    const metrics=box("div","grid grid-cols-2 gap-3 p-4 text-sm");
    for(const [label,v] of [["فروش",`${fmt(s.sales)} ریال`],["سفارش",fmt(s.orders)],["تارگت",s.target?fmt(s.target):"تعیین نشده"],["تحقق",pct(s)]]){
      const part=box("div","rounded-xl bg-slate-50 p-3");part.append(box("p","text-slate-500 text-xs",label),box("strong","block mt-2 break-all",v));metrics.appendChild(part);
    }
    card.appendChild(metrics);
    const foot=box("div","flex items-center justify-between px-4 pb-4 gap-2");
    foot.appendChild(box("span","text-xs text-slate-400",monthRecord(u)?"رکورد ماه موجود است":"هنوز رکورد ماه ندارد"));
    if(u.page){const a=box("a","rounded-lg bg-[#0B3557] px-4 py-2 text-white text-sm","ورود به کارتابل ↗");a.href=`../${u.page}`;a.target="_blank";a.rel="noopener noreferrer";foot.appendChild(a);}
    card.appendChild(foot);cards.appendChild(card);
  }
}

/* 9) روند 12 ماه فقط فروش روغن + IT */
function renderTrend() {
  if(typeof Chart!=="function")return;
  const totals=MONTHS.map(month=>allSalesUsers.reduce((sum,u)=>sum+summary(monthRecord(u,month,reportYear)).sales,0));
  if(chartTrend)chartTrend.destroy();
  chartTrend=new Chart(el("trendChart"),{type:"bar",data:{labels:MONTHS,datasets:[{label:"فروش (میلیون ریال)",data:totals.map(n=>n/1e6),backgroundColor:"#2563EB",borderRadius:5}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
}

/* 10) فعالیت‌های ماه انتخاب‌شده از تمام کارشناسان Sales؛ مرتب‌شده بر اساس تاریخ. */
function renderActivities() {
  const table=el("activitiesTable");table.replaceChildren();
  const all=[];
  for(const u of allSalesUsers)for(const a of summary(monthRecord(u)).activities)all.push({user:u,...a});
  all.sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  el("moreActivities").textContent=showAllActivities?"نمایش کمتر":"مشاهده همه";
  for(const a of (showAllActivities?all:all.slice(0,8))){
    const tr=box("tr","hover:bg-slate-50");
    td(tr,a.date||"—");td(tr,`${a.user.name} / ${TEAM_NAMES[a.user.team]}`);td(tr,a.customer||"—");td(tr,a.product||"—");td(tr,fmt(a.amount));table.appendChild(tr);
  }
  if(!all.length){const tr=box("tr","");td(tr,"برای این ماه فعالیتی ثبت نشده است.","text-slate-500").colSpan=5;table.appendChild(tr);}
}



