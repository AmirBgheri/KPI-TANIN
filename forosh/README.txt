مدیریت فروش KPI طنین — نحوه نصب

مسیر پیشنهادی:
project/
  output.css
  icons/
  FOROSH/
    index.html
    master.js            ← فایل home-master.js این بسته را با این نام جایگزین کن
    sales-users.js       ← فهرست مشترک کاربران
    management/
      index.html
      master.js
    oil/oil-1/index.html + master.js
    computer/it-1/index.html + master.js

۱) حتماً در FOROSH/index.html قبل از master.js درج شود:
<script src="sales-users.js"></script>
<script src="master.js"></script>

اگر HTML فعلی‌ات تغییر کرده، آن را با home-index-example.html جایگزین نکن؛ فقط تگ بالا را اضافه کن.
home-index-example.html فقط نمونه اصلاح ID تکراری و اضافه‌کردن sales-users.js است.

۲) در FOROSH/master.js نسخه home-master.js قرار بده؛ این نسخه کاربران را از sales-users.js می‌گیرد.
۳) در FOROSH/management/ دو فایل index.html و master.js را قرار بده.
۴) مسیر CSS کارتابل مدیریت ../../output.css است؛ اگر ساختار پروژه فرق دارد، مسیر را تغییر بده.
۵) Tailwind باید این HTML را هم در content اسکن کند و output.css از نو ساخته شود.

ثبت کارشناس جدید:
داخل FOROSH/sales-users.js به users یک Object جدید اضافه کن؛ برای نام و TEAM مقدار دقیق کارتابل فرد را وارد کن.
بعد از بارگذاری دوباره صفحه، هم فهرست انتخاب کارشناسان، هم پنل مدیریت آن شخص را نمایش می‌دهد.
اگر شخص فقط در API رکورد دارد ولی در sales-users.js نیست، مدیریت او را تشخیص می‌دهد اما دکمه ورود به کارتابل ندارد تا مسیر page تعریف شود.

API:
FOROSH: https://6a968499fa33b37f821b50b6.mockapi.io/FOROSH
BAZARGANI: https://6a968499fa33b37f821b50b6.mockapi.io/BAZARGANI-Amirbagheri
در management/master.js آدرس‌ها را در صورت تفاوت با سیستم خودت اصلاح کن.

فیلدهای FOROSH: NAME, TEAM, YEAR, MONTH, TARGET, ACTIVITIES, SALES-AMOUNT, ORDER-COUNT, PROFIT-MARGIN
اگر Schema واقعی زیرخط دارد: SCHEMA_STYLE = "underscore" در management/master.js
خواندن هر دو شکل پشتیبانی می‌شود ولی رکورد تازه با شکل SCHEMA_STYLE ساخته خواهد شد.

تارگت کارشناس در همان رکورد NAME+TEAM+YEAR+MONTH ذخیره می‌شود؛
اگر رکورد بود فقط TARGET به‌روزرسانی می‌شود و ACTIVITIES و اطلاعات دیگر عوض نمی‌شوند.
اگر نبود POST رکورد ماه می‌سازد. کارتابل شخص بعد از Reload / GET مجدد، TARGET را نشان می‌دهد.

اگر داشبورد کارشناس هنوز hardcode دارد:
const EXPERT_NAME باید برابر name در sales-users.js باشد؛ TEAM برابر OIL یا COMPUTER.
به صورت طبیعی سیستم مدیریت نمی‌تواند رمز امن ایجاد کند چون این نسخه احراز هویت سمت مرورگر دارد؛ برای بهره‌برداری جدی login سمت سرور لازم است.

توجه: هر ۱۲ ماه برای هر کارشناس ۱۲ رکورد است؛ اگر سقف Resource صد رکورد باشد، پیش از اضافه‌کردن کاربران زیاد مدل ذخیره‌سازی را ارتقا بده.
