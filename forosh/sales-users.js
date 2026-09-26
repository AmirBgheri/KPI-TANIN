/* =============================================================
  فهرست مرکزی کاربران فروش: صفحه ورودی و مدیریت هر دو این فایل را می‌خوانند.
  وقتی کارشناس جدید به برنامه اضافه می‌کنی، او را فقط اینجا اضافه کن.
  NAME باید دقیقاً با EXPERT_NAME در master.js کارتابل فرد یکی باشد.
  TEAM برای فروش فقط OIL یا COMPUTER است؛ ESTELAM جدا گزارش می‌شود.
  رمزهای این فایل امنیت واقعی نیستند؛ برای محصول نهایی احراز هویت سمت سرور لازم است.
============================================================= */
window.SALES_DIRECTORY = {
  management: { name: "مدیریت فروش",  page: "management/index.html" },
  sections: {
    oil: { title: "کارشناسان فروش روغن", subtitle: "کارشناس فروش روغن مورد نظر را انتخاب کنید", avatarClass: "bg-green-100 text-green-600", team: "OIL" },
    computer: { title: "کارشناسان فروش کامپیوتر", subtitle: "کارشناس فروش کامپیوتر مورد نظر را انتخاب کنید", avatarClass: "bg-blue-100 text-blue-600", team: "COMPUTER" },
    estelam: { title: "کارشناسان استعلام", subtitle: "کارشناس استعلام مورد نظر را انتخاب کنید", avatarClass: "bg-purple-100 text-purple-600", team: "ESTELAM" }
  },
  users: [
    { id: "oil-1", name: "کارشناس روغن 1", team: "OIL", role: "کارشناس فروش روغن", initials: "AB",  page: "oil/karshenas oil 1/index.html" },
    { id: "oil-2", name: "کارشناس روغن ۲", team: "OIL", role: "کارشناس فروش روغن", initials: "O2",  page: "oil/karshenas oil 2/index.html" },
    { id: "it-1", name: "کارشناس کامپیوتر ۱", team: "COMPUTER", role: "کارشناس فروش کامپیوتر", initials: "IT1", page: "IT/karshenas it 1/index.html" },
    { id: "it-2", name: "کارشناس کامپیوتر ۲", team: "COMPUTER", role: "کارشناس فروش کامپیوتر", initials: "IT2", page: "IT/karshenas it 2/index.html" },
    { id: "estelam-1", name: "کارشناس استعلام ۱", team: "ESTELAM", role: "کارشناس استعلام", initials: "E1", page: "karshenas estelam/estelam 1/index.html" },
    { id: "estelam-2", name: "کارشناس استعلام ۲", team: "ESTELAM", role: "کارشناس استعلام", initials: "E2", page: "karshenas estelam/estelam 2/index.html" }
  ]
};
