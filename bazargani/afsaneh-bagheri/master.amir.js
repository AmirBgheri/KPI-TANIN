/* =========================================================
   KPI PERSONAL DASHBOARD
   کارشناس: افسانه باقری
   واحد: بازرگانی
========================================================= */


/* =========================================================
   1. تنظیمات اولیه
========================================================= */

const API_URL =
    "https://6a968499fa33b37f821b50b6.mockapi.io/BAZARGANI-Amirbagheri";

const EXPERT_NAME = "افسانه باقری";


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



/* =========================================================
   2. ساخت جدول 12 ماه
========================================================= */

const table =
    document.getElementById(
        "kpiTable"
    );


months.forEach((month, index) => {

    const row =
        document.createElement(
            "tr"
        );


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
            id="response-${index}"
        >

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


        <!-- درصد سفارش خرید -->

        <td
            class="calculated"
            id="purchaseRate-${index}"
        >

            0%

        </td>


        <!-- امتیاز -->

        <td
            class="score-cell"
            id="score-${index}"
        >

            0

        </td>

    `;


    table.appendChild(
        row
    );

});



/* =========================================================
   3. گرفتن اطلاعات یک ماه
========================================================= */

function getMonthData(index) {


    const rfqInput =
        document.querySelector(
            `.rfq[data-month="${index}"]`
        );


    const answeredInput =
        document.querySelector(
            `.answered[data-month="${index}"]`
        );


    const poInput =
        document.querySelector(
            `.po[data-month="${index}"]`
        );


    const cancelledInput =
        document.querySelector(
            `.cancelled[data-month="${index}"]`
        );


    const amountInput =
        document.querySelector(
            `.amount[data-month="${index}"]`
        );



    const rfq =
        Number(
            rfqInput.value
        ) || 0;


    const answered =
        Number(
            answeredInput.value
        ) || 0;


    const po =
        Number(
            poInput.value
        ) || 0;


    const cancelled =
        Number(
            cancelledInput.value
        ) || 0;


    const amount =
        Number(
            amountInput.value
        ) || 0;



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

function calculateScore(
    rfq,
    answered,
    po,
    cancelled
) {


    if (rfq <= 0) {

        return 0;

    }



    /* ===========================
       امتیاز پاسخگویی
       حداکثر 70
    =========================== */


    const responseRate =
        Math.min(

            (answered / rfq) * 100,

            100

        );


    const responseScore =
        responseRate * 0.70;



    /* ===========================
       امتیاز انصرافی
       حداکثر 20
    =========================== */


    const cancellationRate =
        (cancelled / rfq) * 100;


    const cancellationScore =
        Math.max(

            0,

            20 -
            (cancellationRate * 0.20)

        );



    /* ===========================
       امتیاز PO
       حداکثر 10
    =========================== */


    const poScore =
        calculatePOScore(
            po
        );



    /* ===========================
       امتیاز نهایی
    =========================== */


    let finalScore =

        responseScore +

        cancellationScore +

        poScore;



    finalScore =
        Math.max(

            0,

            Math.min(

                100,

                finalScore

            )

        );


    return Math.round(
        finalScore
    );

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


    const scores = [];



    months.forEach((month, index) => {


        const data =
            getMonthData(
                index
            );



        /* ===========================
           Answer نباید بیشتر از RFQ باشد
        =========================== */


        if (
            data.answered >
            data.rfq
        ) {


            data.answered =
                data.rfq;


            document.querySelector(

                `.answered[data-month="${index}"]`

            ).value =
                data.rfq;

        }



        /* ===========================
           PO نباید بیشتر از RFQ باشد
        =========================== */


        if (
            data.po >
            data.rfq
        ) {


            data.po =
                data.rfq;


            document.querySelector(

                `.po[data-month="${index}"]`

            ).value =
                data.rfq;

        }



        /* ===========================
           Cancelled نباید بیشتر از RFQ باشد
        =========================== */


        if (
            data.cancelled >
            data.rfq
        ) {


            data.cancelled =
                data.rfq;


            document.querySelector(

                `.cancelled[data-month="${index}"]`

            ).value =
                data.rfq;

        }



        /* ===========================
           درصد پاسخگویی
        =========================== */


        let responseRate = 0;


        if (
            data.rfq > 0
        ) {


            responseRate =

                (
                    data.answered /
                    data.rfq
                )

                * 100;

        }


        document.getElementById(

            `response-${index}`

        ).innerText =

            Math.round(
                responseRate
            )

            + "%";



        /* ===========================
           درصد سفارش خرید
        =========================== */


        let purchaseRate = 0;


        if (
            data.rfq > 0
        ) {


            purchaseRate =

                (
                    data.po /
                    data.rfq
                )

                * 100;

        }


        document.getElementById(

            `purchaseRate-${index}`

        ).innerText =

            Math.round(
                purchaseRate
            )

            + "%";



        /* ===========================
           امتیاز
        =========================== */


        const score =

            calculateScore(

                data.rfq,

                data.answered,

                data.po,

                data.cancelled

            );


        document.getElementById(

            `score-${index}`

        ).innerText =
            score;


        scores.push(
            score
        );



        /* ===========================
           جمع کل
        =========================== */


        totalRFQ +=
            data.rfq;


        totalAnswered +=
            data.answered;


        totalPO +=
            data.po;


        totalCancelled +=
            data.cancelled;


        totalAmount +=
            data.amount;

    });



    /* =================================================
       عملکرد کل
    ================================================= */


    let totalResponseRate = 0;


    if (
        totalRFQ > 0
    ) {


        totalResponseRate =

            (
                totalAnswered /
                totalRFQ
            )

            * 100;

    }



    let totalPurchaseRate = 0;


    if (
        totalRFQ > 0
    ) {


        totalPurchaseRate =

            (
                totalPO /
                totalRFQ
            )

            * 100;

    }



    const totalScore =

        calculateScore(

            totalRFQ,

            totalAnswered,

            totalPO,

            totalCancelled

        );



    /* =================================================
       کارت‌های بالا
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

        Math.round(
            totalResponseRate
        )

        + "%";


    document.getElementById(
        "totalScore"
    ).innerText =
        totalScore;



    /* =================================================
       جمع پایین جدول
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

        Math.round(
            totalResponseRate
        )

        + "%";


    document.getElementById(
        "sumAmount"
    ).innerText =

        totalAmount
            .toLocaleString();


    document.getElementById(
        "sumPurchaseRate"
    ).innerText =

        Math.round(
            totalPurchaseRate
        )

        + "%";


    document.getElementById(
        "sumScore"
    ).innerText =
        totalScore;



    /* =================================================
       رنگ امتیاز
    ================================================= */


    const scoreElement =
        document.getElementById(
            "totalScore"
        );


    if (
        totalScore >= 90
    ) {


        scoreElement.style.color =
            "#16a34a";


    } else if (
        totalScore >= 80
    ) {


        scoreElement.style.color =
            "#2563eb";


    } else if (
        totalScore >= 70
    ) {


        scoreElement.style.color =
            "#f59e0b";


    } else {


        scoreElement.style.color =
            "#dc2626";

    }



    updateCharts(
        scores
    );

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
        canvas.getContext(
            "2d"
        );


    scoreChart =
        new Chart(

            ctx,

            {

                type:
                    "line",


                data: {

                    labels:
                        months,


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

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    scales: {

                        y: {

                            min:
                                0,


                            max:
                                100,


                            ticks: {

                                stepSize:
                                    10

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



    months.forEach(
        (month, index) => {


            const data =
                getMonthData(
                    index
                );


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

        }
    );



    const ctx =
        canvas.getContext(
            "2d"
        );


    performanceChart =
        new Chart(

            ctx,

            {

                type:
                    "bar",


                data: {

                    labels:
                        months,


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

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    scales: {

                        y: {

                            beginAtZero:
                                true

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


    if (
        scoreChart
    ) {


        scoreChart
            .data
            .datasets[0]
            .data =
            scores;


        scoreChart.update();

    }



    if (
        performanceChart
    ) {


        const rfqData = [];

        const answeredData = [];

        const poData = [];

        const cancelledData = [];



        months.forEach(
            (month, index) => {


                const data =
                    getMonthData(
                        index
                    );


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

            }
        );



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

            event.target
                .classList
                .contains(
                    "input-number"
                )

        ) {


            updateDashboard();

        }

    }

);



/* =========================================================
   11. API FUNCTIONS
========================================================= */


/*
    GET
    دریافت تمام رکوردهای API
*/

async function fetchAllData() {


    const response =
        await fetch(
            API_URL
        );


    if (
        !response.ok
    ) {


        throw new Error(

            `GET ERROR: ${response.status}`

        );

    }


    return await response.json();

}



/*
    POST
    ساخت رکورد جدید
*/

async function createRecord(
    body
) {


    const response =
        await fetch(

            API_URL,

            {

                method:
                    "POST",


                headers: {

                    "Content-Type":
                        "application/json"

                },


                body:
                    JSON.stringify(
                        body
                    )

            }

        );


    if (
        !response.ok
    ) {


        throw new Error(

            `POST ERROR: ${response.status}`

        );

    }


    return await response.json();

}



/*
    PUT
    بروزرسانی رکورد موجود
*/

async function updateRecord(
    id,
    body
) {


    const response =
        await fetch(

            `${API_URL}/${id}`,

            {

                method:
                    "PUT",


                headers: {

                    "Content-Type":
                        "application/json"

                },


                body:
                    JSON.stringify(
                        body
                    )

            }

        );


    if (
        !response.ok
    ) {


        throw new Error(

            `PUT ERROR: ${response.status}`

        );

    }


    return await response.json();

}



/*
    DELETE
    حذف رکورد اضافی
*/

async function deleteRecord(id) {


    const response =
        await fetch(

            `${API_URL}/${id}`,

            {

                method:
                    "DELETE"

            }

        );


    if (
        !response.ok
    ) {


        throw new Error(

            `DELETE ERROR: ${response.status}`

        );

    }

}



/* =========================================================
   12. ذخیره اطلاعات
========================================================= */

/*

    ساختار دیتابیس:

    هر ماه = یک رکورد


    مثال:

    {
        id: 1,
        MONTH: "فروردین",
        RFQ: 20,
        ANSWER: 15,
        CANCELLED: 2,
        PO: 4,
        PO-PRICE: 500000,
        NAME: "افسانه باقری"
    }


    بنابراین برای افسانه باقری:

    فروردین
    اردیبهشت
    خرداد
    ...
    اسفند

    دقیقاً 12 رکورد خواهیم داشت.

*/


async function saveData(
    showSuccessAlert = true
) {


    try {


        /*
            اول updateDashboard اجرا شود
            تا محدودیت‌ها روی Input اعمال شود
        */

        updateDashboard();



        /*
            گرفتن دیتای موجود API
        */

        const allData =
            await fetchAllData();



        /*
            فقط رکوردهای افسانه باقری
        */

        const amirRecords =
            allData.filter(

                item =>

                    String(
                        item.NAME || ""
                    ).trim()

                    ===

                    EXPERT_NAME

            );



        /* =================================================
           حذف رکوردهای اشتباه افسانه

           مثلاً اگر MONTH اشتباه باشد
        ================================================= */


        const invalidRecords =
            amirRecords.filter(

                item =>

                    !months.includes(

                        String(
                            item.MONTH || ""
                        ).trim()

                    )

            );



        for (
            const invalidRecord
            of invalidRecords
        ) {


            await deleteRecord(

                invalidRecord.id

            );

        }



        /* =================================================
           بررسی 12 ماه
        ================================================= */


        for (

            let index = 0;

            index < months.length;

            index++

        ) {


            const month =
                months[index];


            const data =
                getMonthData(
                    index
                );



            /* =================================================
               اطلاعات همان ماه
            ================================================= */


            const body = {


                MONTH:
                    month,


                RFQ:
                    data.rfq,


                ANSWER:
                    data.answered,


                CANCELLED:
                    data.cancelled,


                PO:
                    data.po,


                "PO-PRICE":
                    data.amount,


                NAME:
                    EXPERT_NAME

            };



            /* =================================================
               آیا این ماه قبلاً وجود دارد؟
            ================================================= */


            const sameMonthRecords =
                amirRecords.filter(

                    item =>

                        String(
                            item.MONTH || ""
                        ).trim()

                        ===

                        month

                );



            /* =================================================
               اگر وجود ندارد → POST
            ================================================= */


            if (

                sameMonthRecords.length
                ===
                0

            ) {


                await createRecord(
                    body
                );


            } else {


                /* =================================================
                   اگر وجود دارد → PUT
                ================================================= */


                const mainRecord =
                    sameMonthRecords[0];


                await updateRecord(

                    mainRecord.id,

                    body

                );



                /* =================================================
                   اگر برای یک ماه رکورد تکراری وجود دارد
                   حذفش می‌کنیم.

                   در نتیجه هر ماه فقط یک رکورد دارد.
                ================================================= */


                if (

                    sameMonthRecords.length
                    >
                    1

                ) {


                    const duplicates =
                        sameMonthRecords.slice(
                            1
                        );


                    for (
                        const duplicate
                        of duplicates
                    ) {


                        await deleteRecord(

                            duplicate.id

                        );

                    }

                }

            }

        }



        /* =================================================
           زمان آخرین ذخیره
        ================================================= */


        document.getElementById(

            "lastUpdate"

        ).innerText =

            new Date()
                .toLocaleString(
                    "fa-IR"
                );



        if (
            showSuccessAlert
        ) {


            alert(

                "اطلاعات ۱۲ ماه افسانه باقری با موفقیت ذخیره شد."

            );

        }


    } catch (error) {


        console.error(

            "SAVE ERROR:",

            error

        );


        alert(

            "خطا در ذخیره اطلاعات در API"

        );

    }

}



/* =========================================================
   13. بارگذاری اطلاعات از API
========================================================= */

async function loadData() {


    try {


        /*
            دریافت دیتا
        */

        const allData =
            await fetchAllData();



        /*
            فقط افسانه باقری
        */

        const amirRecords =
            allData.filter(

                item =>

                    String(
                        item.NAME || ""
                    ).trim()

                    ===

                    EXPERT_NAME

            );



        /*
            اول تمام Inputها صفر
        */

        document
            .querySelectorAll(
                ".input-number"
            )
            .forEach(

                input => {

                    input.value =
                        0;

                }

            );



        /*
            قرار دادن هر ماه در ردیف خودش
        */

        months.forEach(

            (month, index) => {


                const item =
                    amirRecords.find(

                        record =>

                            String(
                                record.MONTH || ""
                            ).trim()

                            ===

                            month

                    );



                /*
                    اگر هنوز رکورد ماه ساخته نشده
                */

                if (
                    !item
                ) {

                    return;

                }



                /* RFQ */

                document.querySelector(

                    `.rfq[data-month="${index}"]`

                ).value =

                    Number(
                        item.RFQ
                    )

                    || 0;



                /* ANSWER */

                document.querySelector(

                    `.answered[data-month="${index}"]`

                ).value =

                    Number(
                        item.ANSWER
                    )

                    || 0;



                /* PO */

                document.querySelector(

                    `.po[data-month="${index}"]`

                ).value =

                    Number(
                        item.PO
                    )

                    || 0;



                /* CANCELLED */

                document.querySelector(

                    `.cancelled[data-month="${index}"]`

                ).value =

                    Number(
                        item.CANCELLED
                    )

                    || 0;



                /* PO PRICE */

                document.querySelector(

                    `.amount[data-month="${index}"]`

                ).value =

                    Number(
                        item["PO-PRICE"]
                    )

                    || 0;

            }

        );



        /*
            آخرین بروزرسانی
        */

        document.getElementById(

            "lastUpdate"

        ).innerText =

            amirRecords.length > 0

                ?

                "اطلاعات دریافت‌شده از API"

                :

                "-";



        updateDashboard();


    } catch (error) {


        console.error(

            "LOAD ERROR:",

            error

        );


        alert(

            "خطا در دریافت اطلاعات از API"

        );

    }

}



/* =========================================================
   14. پاک کردن اطلاعات
========================================================= */

/*

    رکوردها را DELETE نمی‌کنیم.

    چون می‌خواهیم همیشه 12 رکورد
    برای افسانه وجود داشته باشد.

    فقط مقادیرشان صفر می‌شود.

*/

async function resetData() {


    const confirmReset =
        confirm(

            "آیا مطمئن هستید که تمام اطلاعات افسانه باقری صفر شود؟"

        );


    if (
        !confirmReset
    ) {

        return;

    }



    /*
        صفر کردن Inputها
    */

    document
        .querySelectorAll(
            ".input-number"
        )
        .forEach(

            input => {

                input.value =
                    0;

            }

        );



    updateDashboard();



    /*
        ذخیره صفرها در API
    */

    await saveData(
        false
    );



    document.getElementById(

        "lastUpdate"

    ).innerText =

        new Date()
            .toLocaleString(
                "fa-IR"
            );



    alert(

        "اطلاعات افسانه باقری صفر شد."

    );

}



/* =========================================================
   15. شروع برنامه
========================================================= */

async function init() {


    /*
        ساخت نمودار امتیاز
    */

    createScoreChart(

        Array(12)
            .fill(0)

    );



    /*
        ساخت نمودار عملکرد
    */

    createPerformanceChart();



    /*
        گرفتن اطلاعات از API
    */

    await loadData();



    /*
        محاسبات اولیه
    */

    updateDashboard();

}


init();