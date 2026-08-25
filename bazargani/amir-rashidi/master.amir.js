/* =========================================================
   KPI PERSONAL DASHBOARD
   کارشناس: امیر باقری
   واحد: بازرگانی
========================================================= */


/* =========================================================
   1. تنظیمات اولیه
========================================================= */

const months = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند"
];


/*
    برای هر کارشناس یک STORAGE_KEY متفاوت قرار بده.

    مثال:
    amir bagheri:
    kpi_amir_bagheri_1405

    amir rashidi:
    kpi_amir_rashidi_1405
*/

const STORAGE_KEY = "kpi_amir_rashidi_1405";


/* =========================================================
   2. ساخت جدول 12 ماه
========================================================= */

const table = document.getElementById("kpiTable");


months.forEach((month, index) => {

    const row = document.createElement("tr");

    row.innerHTML = `

        <td class="month">
            ${month}
        </td>

        <!-- RFQ -->
        <td>
            <input
                type="number"
                min="0"
                class="input-number rfq"
                data-month="${index}"
                value="0"
            >
        </td>

        <!-- پاسخ داده شده -->
        <td>
            <input
                type="number"
                min="0"
                class="input-number answered"
                data-month="${index}"
                value="0"
            >
        </td>

        <!-- سفارش خرید -->
        <td>
            <input
                type="number"
                min="0"
                class="input-number po"
                data-month="${index}"
                value="0"
            >
        </td>

        <!-- انصرافی -->
        <td>
            <input
                type="number"
                min="0"
                class="input-number cancelled"
                data-month="${index}"
                value="0"
            >
        </td>

        <!-- درصد پاسخگویی -->
        <td
            class="calculated"
            id="response-${index}">
            0%
        </td>

        <!-- مبلغ سفارش -->
        <td>
            <input
                type="number"
                min="0"
                class="input-number amount"
                data-month="${index}"
                value="0"
            >
        </td>

        <!-- درصد سفارش -->
        <td
            class="calculated"
            id="purchaseRate-${index}">
            0%
        </td>

        <!-- امتیاز -->
        <td
            class="score-cell"
            id="score-${index}">
            0
        </td>

    `;

    table.appendChild(row);

});


/* =========================================================
   3. گرفتن اطلاعات یک ماه
========================================================= */

function getMonthData(index) {

    const rfqInput = document.querySelector(
        `.rfq[data-month="${index}"]`
    );

    const answeredInput = document.querySelector(
        `.answered[data-month="${index}"]`
    );

    const poInput = document.querySelector(
        `.po[data-month="${index}"]`
    );

    const cancelledInput = document.querySelector(
        `.cancelled[data-month="${index}"]`
    );

    const amountInput = document.querySelector(
        `.amount[data-month="${index}"]`
    );


    const rfq = Number(rfqInput.value) || 0;

    const answered = Number(answeredInput.value) || 0;

    const po = Number(poInput.value) || 0;

    const cancelled = Number(cancelledInput.value) || 0;

    const amount = Number(amountInput.value) || 0;


    return {
        rfq,
        answered,
        po,
        cancelled,
        amount
    };
}


/* =========================================================
   4. محاسبه امتیاز سفارش خرید PO
========================================================= */

/*
    تعداد سفارش خرید     امتیاز

    0                    0
    1                    3
    2                    5
    3                    7
    4                    8
    5 یا بیشتر           10
*/

function calculatePOScore(po) {

    if (po <= 0) {
        return 0;
    }

    if (po === 1) {
        return 3;
    }

    if (po === 2) {
        return 5;
    }

    if (po === 3) {
        return 7;
    }

    if (po === 4) {
        return 8;
    }

    return 10;
}


/* =========================================================
   5. محاسبه امتیاز نهایی
========================================================= */

/*
    پاسخگویی       = 70 امتیاز
    انصرافی        = 20 امتیاز
    سفارش خرید     = 10 امتیاز

    مجموع           = 100
*/

function calculateScore(
    rfq,
    answered,
    po,
    cancelled
) {

    /* اگر RFQ صفر باشد */
    if (rfq <= 0) {
        return 0;
    }


    /* ==========================================
       امتیاز پاسخگویی
       حداکثر 70
    ========================================== */

    const responseRate =
        Math.min(
            (answered / rfq) * 100,
            100
        );


    const responseScore =
        responseRate * 0.70;


    /* ==========================================
       امتیاز کنترل انصرافی
       حداکثر 20
    ========================================== */

    const cancellationRate =
        (cancelled / rfq) * 100;


    const cancellationScore =
        Math.max(
            0,
            20 - (cancellationRate * 0.20)
        );


    /* ==========================================
       امتیاز سفارش خرید
       حداکثر 10
    ========================================== */

    const poScore =
        calculatePOScore(po);


    /* ==========================================
       امتیاز نهایی
    ========================================== */

    let finalScore =
        responseScore +
        cancellationScore +
        poScore;


    /* محدود کردن بین 0 تا 100 */

    finalScore =
        Math.max(
            0,
            Math.min(
                100,
                finalScore
            )
        );


    return Math.round(finalScore);
}


/* =========================================================
   6. بروزرسانی کل داشبورد
========================================================= */

function updateDashboard() {

    let totalRFQ = 0;

    let totalAnswered = 0;

    let totalPO = 0;

    let totalCancelled = 0;

    let totalAmount = 0;

    let scores = [];


    /* ==========================================
       بررسی 12 ماه
    ========================================== */

    months.forEach((month, index) => {

        let data = getMonthData(index);


        /* ======================================
           جلوگیری از بیشتر بودن پاسخ از RFQ
        ====================================== */

        if (data.answered > data.rfq) {

            data.answered = data.rfq;

            document.querySelector(
                `.answered[data-month="${index}"]`
            ).value = data.rfq;
        }


        /* ======================================
           جلوگیری از بیشتر بودن PO از RFQ
        ====================================== */

        if (data.po > data.rfq) {

            data.po = data.rfq;

            document.querySelector(
                `.po[data-month="${index}"]`
            ).value = data.rfq;
        }


        /* ======================================
           جلوگیری از بیشتر بودن انصرافی از RFQ
        ====================================== */

        if (data.cancelled > data.rfq) {

            data.cancelled = data.rfq;

            document.querySelector(
                `.cancelled[data-month="${index}"]`
            ).value = data.rfq;
        }


        /* ======================================
           درصد پاسخگویی
        ====================================== */

        let responseRate = 0;


        if (data.rfq > 0) {

            responseRate =
                (data.answered / data.rfq) * 100;
        }


        document.getElementById(
            `response-${index}`
        ).innerText =
            Math.round(responseRate) + "%";


        /* ======================================
           درصد سفارش خرید
        ====================================== */

        let purchaseRate = 0;


        if (data.rfq > 0) {

            purchaseRate =
                (data.po / data.rfq) * 100;
        }


        document.getElementById(
            `purchaseRate-${index}`
        ).innerText =
            Math.round(purchaseRate) + "%";


        /* ======================================
           محاسبه امتیاز
        ====================================== */

        const score =
            calculateScore(
                data.rfq,
                data.answered,
                data.po,
                data.cancelled
            );


        document.getElementById(
            `score-${index}`
        ).innerText = score;


        /* ذخیره امتیاز برای نمودار */

        scores.push(score);


        /* ======================================
           جمع کل
        ====================================== */

        totalRFQ += data.rfq;

        totalAnswered += data.answered;

        totalPO += data.po;

        totalCancelled += data.cancelled;

        totalAmount += data.amount;

    });


    /* =================================================
       محاسبه عملکرد کل
    ================================================= */

    let totalResponseRate = 0;


    if (totalRFQ > 0) {

        totalResponseRate =
            (totalAnswered / totalRFQ) * 100;
    }


    let totalPurchaseRate = 0;


    if (totalRFQ > 0) {

        totalPurchaseRate =
            (totalPO / totalRFQ) * 100;
    }


    /* امتیاز کل */

    const totalScore =
        calculateScore(
            totalRFQ,
            totalAnswered,
            totalPO,
            totalCancelled
        );


    /* =================================================
       بروزرسانی کارت‌های بالای داشبورد
    ================================================= */

    document.getElementById(
        "totalRFQ"
    ).innerText =
        totalRFQ;


    document.getElementById(
        "totalAnswered"
    ).innerText =
        totalAnswered;


    document.getElementById(
        "totalPO"
    ).innerText =
        totalPO;


    document.getElementById(
        "totalResponse"
    ).innerText =
        Math.round(totalResponseRate) + "%";


    document.getElementById(
        "totalScore"
    ).innerText =
        totalScore;


    /* =================================================
       بروزرسانی جمع پایین جدول
    ================================================= */

    document.getElementById(
        "sumRFQ"
    ).innerText =
        totalRFQ;


    document.getElementById(
        "sumAnswered"
    ).innerText =
        totalAnswered;


    document.getElementById(
        "sumPO"
    ).innerText =
        totalPO;


    document.getElementById(
        "sumCancelled"
    ).innerText =
        totalCancelled;


    document.getElementById(
        "sumResponse"
    ).innerText =
        Math.round(totalResponseRate) + "%";


    document.getElementById(
        "sumAmount"
    ).innerText =
        totalAmount.toLocaleString();


    document.getElementById(
        "sumPurchaseRate"
    ).innerText =
        Math.round(totalPurchaseRate) + "%";


    document.getElementById(
        "sumScore"
    ).innerText =
        totalScore;


    /* =================================================
       تغییر رنگ امتیاز
    ================================================= */

    const scoreElement =
        document.getElementById("totalScore");


    if (totalScore >= 90) {

        scoreElement.style.color =
            "#16a34a";

    } else if (totalScore >= 80) {

        scoreElement.style.color =
            "#2563eb";

    } else if (totalScore >= 70) {

        scoreElement.style.color =
            "#f59e0b";

    } else {

        scoreElement.style.color =
            "#dc2626";
    }


    /* =================================================
       بروزرسانی نمودار
    ================================================= */

    updateCharts(scores);
}


/* =========================================================
   7. نمودار امتیاز
========================================================= */

let scoreChart = null;


function createScoreChart(scores) {

    const canvas =
        document.getElementById(
            "scoreChart"
        );


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    scoreChart =
        new Chart(
            ctx,
            {

                type: "line",

                data: {

                    labels: months,

                    datasets: [

                        {

                            label:
                                "امتیاز عملکرد",

                            data:
                                scores,

                            borderColor:
                                "#f97316",

                            backgroundColor:
                                "rgba(249,115,22,.12)",

                            borderWidth:
                                3,

                            pointRadius:
                                5,

                            pointBackgroundColor:
                                "#f97316",

                            fill:
                                true,

                            tension:
                                0.3
                        }

                    ]
                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            min: 0,

                            max: 100,

                            ticks: {

                                stepSize: 10

                            }

                        }

                    }

                }

            }
        );
}


/* =========================================================
   8. نمودار عملکرد ماهانه
========================================================= */

let performanceChart = null;


function createPerformanceChart() {

    const canvas =
        document.getElementById(
            "performanceChart"
        );


    if (!canvas) {
        return;
    }


    const rfqData = [];

    const answeredData = [];

    const poData = [];

    const cancelledData = [];


    months.forEach((month, index) => {

        const data =
            getMonthData(index);


        rfqData.push(
            data.rfq
        );

        answeredData.push(
            data.answered
        );

        poData.push(
            data.po
        );

        cancelledData.push(
            data.cancelled
        );

    });


    const ctx =
        canvas.getContext("2d");


    performanceChart =
        new Chart(
            ctx,
            {

                type: "bar",

                data: {

                    labels: months,

                    datasets: [

                        {

                            label:
                                "RFQ",

                            data:
                                rfqData,

                            backgroundColor:
                                "#fbbf24"

                        },


                        {

                            label:
                                "پاسخ داده شده",

                            data:
                                answeredData,

                            backgroundColor:
                                "#38bdf8"

                        },


                        {

                            label:
                                "PO",

                            data:
                                poData,

                            backgroundColor:
                                "#22c55e"

                        },


                        {

                            label:
                                "انصرافی",

                            data:
                                cancelledData,

                            backgroundColor:
                                "#ef4444"

                        }

                    ]
                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }
        );
}


/* =========================================================
   9. بروزرسانی نمودارها
========================================================= */

function updateCharts(scores) {


    /* ==========================================
       نمودار امتیاز
    ========================================== */

    if (scoreChart) {

        scoreChart
            .data
            .datasets[0]
            .data =
            scores;


        scoreChart.update();
    }


    /* ==========================================
       نمودار عملکرد
    ========================================== */

    if (performanceChart) {

        const rfqData = [];

        const answeredData = [];

        const poData = [];

        const cancelledData = [];


        months.forEach((month, index) => {

            const data =
                getMonthData(index);


            rfqData.push(
                data.rfq
            );

            answeredData.push(
                data.answered
            );

            poData.push(
                data.po
            );

            cancelledData.push(
                data.cancelled
            );

        });


        performanceChart
            .data
            .datasets[0]
            .data =
            rfqData;


        performanceChart
            .data
            .datasets[1]
            .data =
            answeredData;


        performanceChart
            .data
            .datasets[2]
            .data =
            poData;


        performanceChart
            .data
            .datasets[3]
            .data =
            cancelledData;


        performanceChart.update();
    }
}


/* =========================================================
   10. وقتی Input تغییر کرد
========================================================= */

document.addEventListener(
    "input",
    function (event) {

        if (
            event.target.classList.contains(
                "input-number"
            )
        ) {

            updateDashboard();

        }

    }
);


/* =========================================================
   11. ذخیره اطلاعات
========================================================= */

function saveData() {

    const data = [];


    months.forEach((month, index) => {

        data.push({

            rfq:
                document.querySelector(
                    `.rfq[data-month="${index}"]`
                ).value,

            answered:
                document.querySelector(
                    `.answered[data-month="${index}"]`
                ).value,

            po:
                document.querySelector(
                    `.po[data-month="${index}"]`
                ).value,

            cancelled:
                document.querySelector(
                    `.cancelled[data-month="${index}"]`
                ).value,

            amount:
                document.querySelector(
                    `.amount[data-month="${index}"]`
                ).value

        });

    });


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );


    /* تاریخ آخرین ذخیره */

    document.getElementById(
        "lastUpdate"
    ).innerText =
        new Date().toLocaleString(
            "fa-IR"
        );


    alert(
        "اطلاعات با موفقیت ذخیره شد."
    );
}


/* =========================================================
   12. بارگذاری اطلاعات ذخیره شده
========================================================= */

function loadData() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    /* اگر اطلاعاتی ذخیره نشده باشد */

    if (!saved) {
        return;
    }


    const data =
        JSON.parse(saved);


    data.forEach((item, index) => {

        const rfq =
            document.querySelector(
                `.rfq[data-month="${index}"]`
            );


        const answered =
            document.querySelector(
                `.answered[data-month="${index}"]`
            );


        const po =
            document.querySelector(
                `.po[data-month="${index}"]`
            );


        const cancelled =
            document.querySelector(
                `.cancelled[data-month="${index}"]`
            );


        const amount =
            document.querySelector(
                `.amount[data-month="${index}"]`
            );


        if (rfq) {

            rfq.value =
                item.rfq || 0;

        }


        if (answered) {

            answered.value =
                item.answered || 0;

        }


        if (po) {

            po.value =
                item.po || 0;

        }


        if (cancelled) {

            cancelled.value =
                item.cancelled || 0;

        }


        if (amount) {

            amount.value =
                item.amount || 0;

        }

    });


    /* نمایش زمان ذخیره */

    document.getElementById(
        "lastUpdate"
    ).innerText =
        "اطلاعات ذخیره‌شده";

}


/* =========================================================
   13. پاک کردن اطلاعات
========================================================= */

function resetData() {

    const confirmReset =
        confirm(
            "آیا مطمئن هستید که تمام اطلاعات این کارشناس پاک شود؟"
        );


    if (!confirmReset) {
        return;
    }


    /* حذف LocalStorage */

    localStorage.removeItem(
        STORAGE_KEY
    );


    /* صفر کردن تمام Inputها */

    document
        .querySelectorAll(
            ".input-number"
        )
        .forEach(input => {

            input.value = 0;

        });


    /* حذف تاریخ */

    document.getElementById(
        "lastUpdate"
    ).innerText =
        "-";


    /* محاسبه مجدد */

    updateDashboard();
}


/* =========================================================
   14. شروع برنامه
========================================================= */


/* ابتدا اطلاعات قبلی را بخوان */

loadData();


/* ساخت نمودار امتیاز */

createScoreChart(
    Array(12).fill(0)
);


/* ساخت نمودار عملکرد */

createPerformanceChart();


/* محاسبه اولیه */

updateDashboard();