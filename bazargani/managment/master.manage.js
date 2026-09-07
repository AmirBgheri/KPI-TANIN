/* =========================================================
   KPI MANAGEMENT DASHBOARD
   واحد بازرگانی
========================================================= */


/* =========================================================
   1. API
========================================================= */

const API_URL =
    "https://6a968499fa33b37f821b50b6.mockapi.io/BAZARGANI-Amirbagheri";


/* =========================================================
   2. مسیر کارتابل کارشناسان
========================================================= */

const EXPERT_PAGES = {

    "امیر باقری":
        "../amir-bagheri/index.html",

    "امیر رشیدی":
        "../amir-rashidi/index.html",

    "عالیه کرمانشاهیان":
        "../aliye-kermanshahian/index.html",

    "افسانه باقری":
        "../afsaneh-bagheri/index.html"

};


/* =========================================================
   3. نمودار
========================================================= */

let comparisonChart = null;


/* =========================================================
   4. امتیاز PO
   همان فرمول کارتابل شخصی
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
   5. محاسبه KPI
   دقیقاً همان فرمول کارتابل کارشناس
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


    /* پاسخگویی */

    const responseRate =
        Math.min(
            (answered / rfq) * 100,
            100
        );


    const responseScore =
        responseRate * 0.70;


    /* انصرافی */

    const cancellationRate =
        (cancelled / rfq) * 100;


    const cancellationScore =
        Math.max(
            0,
            20 -
            (cancellationRate * 0.20)
        );


    /* سفارش خرید */

    const poScore =
        calculatePOScore(
            po
        );


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
   6. دریافت اطلاعات API
========================================================= */

async function fetchAllData() {

    const response =
        await fetch(
            API_URL
        );


    if (!response.ok) {

        throw new Error(
            `API ERROR: ${response.status}`
        );

    }


    return await response.json();
}


/* =========================================================
   7. گروه‌بندی اطلاعات بر اساس کارشناس
========================================================= */

function groupExperts(data) {


    const experts = {};


    data.forEach(item => {


        const name =
            String(
                item.NAME || ""
            ).trim();


        /*
            رکورد بدون NAME
            وارد محاسبات نشود
        */

        if (!name) {

            return;

        }


        /*
            اگر اولین رکورد این کارشناس است
        */

        if (!experts[name]) {

            experts[name] = {

                name:
                    name,

                rfq:
                    0,

                answered:
                    0,

                po:
                    0,

                cancelled:
                    0,

                amount:
                    0,

                months:
                    0

            };

        }


        /*
            جمع کردن رکوردهای 12 ماه
        */

        experts[name].rfq +=
            Number(
                item.RFQ
            ) || 0;


        experts[name].answered +=
            Number(
                item.ANSWER
            ) || 0;


        experts[name].po +=
            Number(
                item.PO
            ) || 0;


        experts[name].cancelled +=
            Number(
                item.CANCELLED
            ) || 0;


        experts[name].amount +=
            Number(
                item["PO-PRICE"]
            ) || 0;


        experts[name].months++;

    });


    /*
        Object → Array
    */

    return Object.values(
        experts
    );
}


/* =========================================================
   8. محاسبه اطلاعات نهایی هر کارشناس
========================================================= */

function calculateExpertStats(
    experts
) {


    return experts.map(
        expert => {


            /*
                درصد پاسخگویی
            */

            let responseRate =
                0;


            if (
                expert.rfq > 0
            ) {

                responseRate =

                    (
                        expert.answered /
                        expert.rfq
                    )

                    * 100;

            }


            /*
                درصد سفارش خرید
            */

            let purchaseRate =
                0;


            if (
                expert.rfq > 0
            ) {

                purchaseRate =

                    (
                        expert.po /
                        expert.rfq
                    )

                    * 100;

            }


            /*
                امتیاز نهایی
            */

            const score =
                calculateScore(

                    expert.rfq,

                    expert.answered,

                    expert.po,

                    expert.cancelled

                );


            return {

                ...expert,

                responseRate:
                    Math.round(
                        responseRate
                    ),

                purchaseRate:
                    Math.round(
                        purchaseRate
                    ),

                score:
                    score

            };

        }
    );
}


/* =========================================================
   9. ساخت حروف Avatar
========================================================= */

function createInitials(name) {


    const parts =
        name
            .trim()
            .split(/\s+/);


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(
                0,
                2
            );

    }


    return (

        parts[0]
            .charAt(0)

        +

        parts[
            parts.length - 1
        ].charAt(0)

    );

}


/* =========================================================
   10. تعیین وضعیت عملکرد
========================================================= */

function getPerformanceText(score) {


    if (
        score >= 90
    ) {

        return "عالی";

    }


    if (
        score >= 80
    ) {

        return "خیلی خوب";

    }


    if (
        score >= 70
    ) {

        return "خوب";

    }


    if (
        score >= 60
    ) {

        return "متوسط";

    }


    return "نیازمند بهبود";

}


/* =========================================================
   11. ساخت کارت کارشناسان
========================================================= */

function renderExpertCards(
    experts
) {


    const container =
        document.getElementById(
            "expertGrid"
        );


    container.innerHTML =
        "";


    /*
        مرتب‌سازی از بالاترین امتیاز
        به پایین‌ترین
    */

    const sortedExperts =
        [...experts]
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            );


    sortedExperts.forEach(
        expert => {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "expert-performance-card";


            const page =
                EXPERT_PAGES[
                    expert.name
                ];


            card.innerHTML = `

                <div class="expert-card-header">

                    <div class="expert-avatar">

                        ${createInitials(
                            expert.name
                        )}

                    </div>


                    <div>

                        <h3>

                            ${expert.name}

                        </h3>

                        <span>

                            کارشناس بازرگانی

                        </span>

                    </div>

                </div>


                <div class="expert-score">

                    <strong>

                        ${expert.score}

                    </strong>

                    <span>
                        / 100
                    </span>

                    <small>

                        ${getPerformanceText(
                            expert.score
                        )}

                    </small>

                </div>


                <div class="expert-stats">


                    <div>

                        <span>
                            RFQ
                        </span>

                        <strong>

                            ${expert.rfq}

                        </strong>

                    </div>


                    <div>

                        <span>
                            پاسخ
                        </span>

                        <strong>

                            ${expert.answered}

                        </strong>

                    </div>


                    <div>

                        <span>
                            PO
                        </span>

                        <strong>

                            ${expert.po}

                        </strong>

                    </div>


                    <div>

                        <span>
                            پاسخگویی
                        </span>

                        <strong>

                            ${expert.responseRate}%

                        </strong>

                    </div>


                </div>


                <button
                    class="cartable-btn"

                    ${
                        page
                            ?
                            ""
                            :
                            "disabled"
                    }

                    data-page="${page || ""}"
                >

                    ورود به کارتابل کارشناس

                </button>

            `;


            /*
                دکمه ورود به کارتابل
            */

            const button =
                card.querySelector(
                    ".cartable-btn"
                );


            if (page) {

                button.addEventListener(
                    "click",
                    function () {

                        window.location.href =
                            page;

                    }
                );

            }


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   12. اطلاعات کلی واحد بازرگانی
========================================================= */

function updateManagementSummary(
    experts
) {


    let totalRFQ = 0;

    let totalAnswered = 0;

    let totalPO = 0;


    experts.forEach(
        expert => {


            totalRFQ +=
                expert.rfq;


            totalAnswered +=
                expert.answered;


            totalPO +=
                expert.po;

        }
    );


    document.getElementById(
        "expertCount"
    ).innerText =
        experts.length;


    document.getElementById(
        "allRFQ"
    ).innerText =
        totalRFQ;


    document.getElementById(
        "allAnswered"
    ).innerText =
        totalAnswered;


    document.getElementById(
        "allPO"
    ).innerText =
        totalPO;

}


/* =========================================================
   13. نمودار مقایسه کارشناسان
========================================================= */

function renderComparisonChart(
    experts
) {


    const canvas =
        document.getElementById(
            "expertComparisonChart"
        );


    if (!canvas) {

        return;

    }


    /*
        ترتیب از امتیاز بیشتر
        به کمتر
    */

    const sorted =
        [...experts]
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            );


    const names =
        sorted.map(
            expert =>
                expert.name
        );


    const scores =
        sorted.map(
            expert =>
                expert.score
        );


    /*
        اگر نمودار قبلاً ساخته شده
        حذف شود
    */

    if (
        comparisonChart
    ) {

        comparisonChart.destroy();

    }


    comparisonChart =
        new Chart(

            canvas,

            {

                type:
                    "bar",


                data: {

                    labels:
                        names,


                    datasets: [

                        {

                            label:
                                "امتیاز عملکرد",


                            data:
                                scores,


                            backgroundColor:
                                "#0ea5e9",


                            borderRadius:
                                8

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    },


                    scales: {

                        y: {

                            beginAtZero:
                                true,


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
   14. شروع صفحه مدیریت
========================================================= */

async function initManagement() {


    try {


        /*
            1. گرفتن تمام اطلاعات
        */

        const data =
            await fetchAllData();



        /*
            2. گروه‌بندی بر اساس NAME
        */

        const groupedExperts =
            groupExperts(
                data
            );



        /*
            3. محاسبه KPI هر نفر
        */

        const experts =
            calculateExpertStats(
                groupedExperts
            );



        /*
            4. کارت‌ها
        */

        renderExpertCards(
            experts
        );



        /*
            5. خلاصه مدیریت
        */

        updateManagementSummary(
            experts
        );



        /*
            6. نمودار مقایسه
        */

        renderComparisonChart(
            experts
        );


    } catch (error) {


        console.error(
            "MANAGEMENT ERROR:",
            error
        );


        alert(
            "خطا در دریافت اطلاعات کارشناسان"
        );

    }

}


/* =========================================================
   اجرای برنامه
========================================================= */

initManagement();