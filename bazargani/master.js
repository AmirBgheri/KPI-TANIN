 const dateElement =
            document.querySelector("#date");

            const today =
            new Date();


        dateElement.textContent =
            today.toLocaleDateString(
                "fa-IR",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

        // ========================================================
        // MAIN ELEMENTS
        // ========================================================

        const cards =
            document.querySelector("#cards");

        const usersSection =
            document.querySelector("#users");

        const KARSHENASAN =
            document.querySelector("#KARSHENASAN");

        const back =
            document.querySelector("#back");

        // ========================================================
        // PASSWORD USERS
        // ========================================================
        /*
            رمز هر کارشناس را اینجا تغییر بده.
            password = رمز ورود
            page = صفحه داشبورد همان کارشناس
        */

        const userAccounts = {

            "Amir Rashidi": {
                password: "1234",
                page: "amir-rashidi/index.html"
            },

            "Aliye Kermanshahian": {
                password: "1050",
                page: "aliye-kermanshahian/index.html"
            },

            "Amir Bagheri": {
                password: "1111",
                page: "amir-bagheri/index.html"
            },

            "Afsaneh Bagheri": {
                password: "2222",
                page: "expert/afsaneh-bagheri.html"
            },

            "Expert 5": {
                password: "3333",
                page: "expert/expert5.html"
            }


        };

        // ========================================================
        // OPEN USERS
        // ========================================================

        KARSHENASAN.addEventListener(
            "click",
            function () {

                // خروج Cards

                cards.classList.add(
                    "opacity-0",
                    "-translate-x-10"
                );

                // بعد از Animation

                setTimeout(
                    function () {

                        cards.classList.add(
                            "hidden"
                        );

                        // نمایش Users

                        usersSection.classList.remove(
                            "hidden"
                        );

                        // Animation Users

                        setTimeout(
                            function () {


                                usersSection.classList.remove(
                                    "opacity-0",
                                    "translate-x-10"
                                );

                            },
                            50
                        );

                    },
                    500
                );

            }
        );


        // ========================================================
        // BACK TO CARDS
        // ========================================================

        back.addEventListener(
            "click",
            function () {


                // خروج Users

                usersSection.classList.add(
                    "opacity-0",
                    "translate-x-10"
                );


                setTimeout(
                    function () {


                        usersSection.classList.add(
                            "hidden"
                        );

                        // نمایش Cards

                        cards.classList.remove(
                            "hidden"
                        );

                        // Animation Cards
                        setTimeout(
                            function () {

                                cards.classList.remove(
                                    "opacity-0",
                                    "-translate-x-10"
                                );

                            },
                            50
                        );


                    },
                    500
                );


            }
        );


        // ========================================================
        // PASSWORD MODAL ELEMENTS
        // ========================================================

        const userCards =
            document.querySelectorAll(
                ".user-card"
            );


        const passwordModal =
            document.querySelector(
                "#passwordModal"
            );


        const passwordBox =
            document.querySelector(
                "#passwordBox"
            );


        const passwordInput =
            document.querySelector(
                "#passwordInput"
            );


        const passwordError =
            document.querySelector(
                "#passwordError"
            );


        const selectedUser =
            document.querySelector(
                "#selectedUser"
            );


        const loginButton =
            document.querySelector(
                "#loginButton"
            );


        const cancelButton =
            document.querySelector(
                "#cancelButton"
            );



        // کاربر انتخاب شده

        let selectedUserName = null;

        // ========================================================
        // CLICK USER CARD
        // ========================================================

        userCards.forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function () {

                        // نام کاربر

                        selectedUserName =
                            card.dataset.user;

                        // نمایش نام

                        selectedUser.textContent =
                            selectedUserName;

                        // پاک کردن Input

                        passwordInput.value =
                            "";

                        // مخفی کردن Error

                        passwordError.classList.add(
                            "hidden"
                        );

                        // حذف رنگ خطا

                        passwordInput.classList.remove(
                            "border-red-500"
                        );

                        // نمایش Modal

                        passwordModal.classList.remove(
                            "hidden"
                        );

                        passwordModal.classList.add(
                            "flex"
                        );

                        // Animation

                        setTimeout(
                            function () {

                                passwordModal.classList.remove(
                                    "opacity-0"
                                );

                                passwordBox.classList.remove(
                                    "scale-95"
                                );

                                passwordBox.classList.add(
                                    "scale-100"
                                );

                                // Focus

                                passwordInput.focus();

                            },
                            50
                        );


                    }
                );
            }
        );



        // ========================================================
        // LOGIN
        // ========================================================

        loginButton.addEventListener(
            "click",
            function () {


                const enteredPassword =
                    passwordInput.value;


                const selectedAccount =
                    userAccounts[
                        selectedUserName
                    ];



                // بررسی

                if (
                    selectedAccount &&
                    enteredPassword ===
                    selectedAccount.password
                ) {

                    // رمز درست

                    window.location.href =
                        selectedAccount.page;

                }

                else {

                    // رمز اشتباه

                    passwordError.classList.remove(
                        "hidden"
                    );

                    passwordInput.classList.add(
                        "border-red-500"
                    );

                    passwordInput.focus();

                }


            }
        );



        // ========================================================
        // ENTER KEY
        // ========================================================

        passwordInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    loginButton.click();

                }

            }
        );

        // ========================================================
        // CANCEL
        // ========================================================

        cancelButton.addEventListener(
            "click",
            function () {
                closePasswordModal();
            }
        );



        // ========================================================
        // CLOSE MODAL
        // ========================================================

        function closePasswordModal() {


            // خروج Animation

            passwordModal.classList.add(
                "opacity-0"
            );


            passwordBox.classList.remove(
                "scale-100"
            );


            passwordBox.classList.add(
                "scale-95"
            );


            setTimeout(
                function () {


                    passwordModal.classList.add(
                        "hidden"
                    );


                    passwordModal.classList.remove(
                        "flex"
                    );


                    passwordInput.value =
                        "";


                    passwordError.classList.add(
                        "hidden"
                    );


                    passwordInput.classList.remove(
                        "border-red-500"
                    );


                },
                300
            );


        }
