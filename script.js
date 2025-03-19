document.addEventListener("DOMContentLoaded", function () {
    // Xóa dữ liệu khi tắt trình duyệt
    if (!sessionStorage.getItem("sessionActive")) {
        localStorage.clear();
        sessionStorage.setItem("sessionActive", "true");
    }

    // QUẢN LÝ TÀI KHOẢN
    let users = JSON.parse(localStorage.getItem("users")) || {};
    let isLogin = false;

    const formTitle = document.getElementById("formTitle");
    const authForm = document.getElementById("authForm");
    const toggleAuth = document.getElementById("toggleAuth");

    if (authForm) {
        toggleAuth.addEventListener("click", function (e) {
            e.preventDefault();
            isLogin = !isLogin;
            formTitle.textContent = isLogin ? "Đăng Nhập" : "Đăng Ký";
            authForm.querySelector("button").textContent = isLogin ? "Đăng Nhập" : "Đăng Ký";
            toggleAuth.textContent = isLogin ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập";
        });

        authForm.addEventListener("submit", function (e) {
            e.preventDefault();
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;

            if (isLogin) {
                if (users[username] && users[username] === password) {
                    sessionStorage.setItem("loggedInUser", username);
                    window.location.href = "index.html";
                } else {
                    alert("Sai tài khoản hoặc mật khẩu!");
                }
            } else {
                if (users[username]) {
                    alert("Tài khoản đã tồn tại!");
                } else {
                    users[username] = password;
                    localStorage.setItem("users", JSON.stringify(users));
                    localStorage.setItem(`balance_${username}`, "0");
                    localStorage.setItem(`transactions_${username}`, JSON.stringify([]));
                    alert("Đăng ký thành công! Hãy đăng nhập.");
                    toggleAuth.click();
                }
            }
        });
    }

    // KIỂM TRA ĐĂNG NHẬP TRÊN TRANG QUẢN LÝ TÀI CHÍNH
    let loggedInUser = sessionStorage.getItem("loggedInUser");
    if (window.location.pathname.includes("index.html")) {
        if (!loggedInUser) {
            window.location.href = "login.html";
        } else {
            initFinanceApp(loggedInUser);
        }
    }

    function initFinanceApp(username) {
        let balance = parseFloat(localStorage.getItem(`balance_${username}`)) || 0;
        let transactions = JSON.parse(localStorage.getItem(`transactions_${username}`)) || [];

        let balanceDisplay = document.getElementById("balance");
        let transactionList = document.getElementById("transactionList");

        balanceDisplay.textContent = balance.toLocaleString() + " VND";

        function renderTransactions() {
            transactionList.innerHTML = "";
            transactions.forEach((transaction, index) => {
                let row = transactionList.insertRow();
                row.insertCell(0).textContent = transaction.description;
                row.insertCell(1).textContent = transaction.amount.toLocaleString() + " VND";

                let deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Xóa";
                deleteBtn.onclick = function () {
                    balance -= transaction.amount;
                    transactions.splice(index, 1);
                    localStorage.setItem(`balance_${username}`, balance);
                    localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
                    balanceDisplay.textContent = balance.toLocaleString() + " VND";
                    renderTransactions();
                };
                row.insertCell(2).appendChild(deleteBtn);
            });
        }
        renderTransactions();

        document.getElementById("addTransactionBtn").addEventListener("click", function () {
            let description = document.getElementById("description").value;
            let amount = parseFloat(document.getElementById("amount").value);

            if (description && !isNaN(amount)) {
                balance += amount;
                transactions.push({ description, amount });

                localStorage.setItem(`balance_${username}`, balance);
                localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));

                balanceDisplay.textContent = balance.toLocaleString() + " VND";
                renderTransactions();

                document.getElementById("description").value = "";
                document.getElementById("amount").value = "";
            } else {
                alert("Vui lòng nhập thông tin hợp lệ!");
            }
        });
        // Đăng xuất
        document.getElementById("logoutBtn").addEventListener("click", function () {
            sessionStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }
});
