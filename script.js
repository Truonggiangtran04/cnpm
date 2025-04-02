document.addEventListener("DOMContentLoaded", function () {
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
            let username = document.getElementById("username").value.trim();
            let password = document.getElementById("password").value.trim();

            if (!username || !password) {
                alert("Vui lòng nhập đầy đủ thông tin!");
                return;
            }

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
                    localStorage.setItem(`budget_${username}`, "0"); // Thêm lưu ngân sách
                    alert("Đăng ký thành công! Chuyển sang đăng nhập...");
                    toggleAuth.click();
                }
            }
        });
    }

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
        let budget = parseFloat(localStorage.getItem(`budget_${username}`)) || 0;

        let balanceDisplay = document.getElementById("balance");
        let transactionList = document.getElementById("transactionList");
        let budgetInput = document.getElementById("budget");
        let remainingDisplay = document.getElementById("remaining");

        balanceDisplay.textContent = balance.toLocaleString() + " VND";
        budgetInput.value = budget;
        updateRemaining();

        function renderTransactions() {
            transactionList.innerHTML = "";
            transactions.forEach((transaction, index) => {
                let row = transactionList.insertRow();

                // Cột Mô tả
                let descriptionCell = row.insertCell(0);
                let descriptionText = document.createElement("span");
                descriptionText.textContent = transaction.description;
                let descriptionInput = document.createElement("input");
                descriptionInput.value = transaction.description;
                descriptionInput.style.display = "none";
                descriptionCell.appendChild(descriptionText);
                descriptionCell.appendChild(descriptionInput);

                // Cột Số tiền
                let amountCell = row.insertCell(1);
                let amountText = document.createElement("span");
                amountText.textContent = transaction.amount.toLocaleString() + " VND";
                let amountInput = document.createElement("input");
                amountInput.type = "number";
                amountInput.value = transaction.amount;
                amountInput.style.display = "none";
                amountCell.appendChild(amountText);
                amountCell.appendChild(amountInput);

                // Cột Hành động
                let actionCell = row.insertCell(2);
                let editBtn = document.createElement("button");
                editBtn.textContent = "Sửa";
                let saveBtn = document.createElement("button");
                saveBtn.textContent = "Lưu";
                saveBtn.style.display = "none";
                let deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Xóa";

                // Sự kiện khi nhấn nút "Sửa"
                editBtn.onclick = function () {
                    descriptionText.style.display = "none";
                    descriptionInput.style.display = "inline-block";
                    amountText.style.display = "none";
                    amountInput.style.display = "inline-block";
                    editBtn.style.display = "none";
                    saveBtn.style.display = "inline-block";
                };

                // Sự kiện khi nhấn nút "Lưu"
                saveBtn.onclick = function () {
                    let newDescription = descriptionInput.value.trim();
                    let newAmount = parseFloat(amountInput.value);

                    if (!newDescription || isNaN(newAmount)) {
                        alert("Vui lòng nhập thông tin hợp lệ!");
                        return;
                    }

                    let oldAmount = transactions[index].amount;
                    transactions[index].description = newDescription;
                    transactions[index].amount = newAmount;

                    // Cập nhật số dư
                    balance += (newAmount - oldAmount);
                    localStorage.setItem(`balance_${username}`, balance);
                    localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));

                    // Cập nhật giao diện
                    balanceDisplay.textContent = balance.toLocaleString() + " VND";
                    updateRemaining();
                    renderTransactions();
                };

                // Sự kiện khi nhấn nút "Xóa"
                deleteBtn.onclick = function () {
                    if (confirm("Bạn có chắc muốn xóa giao dịch này?")) {
                        balance -= transactions[index].amount;
                        transactions.splice(index, 1);
                        localStorage.setItem(`balance_${username}`, balance);
                        localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));
                        balanceDisplay.textContent = balance.toLocaleString() + " VND";
                        updateRemaining();
                        renderTransactions();
                    }
                };

                actionCell.appendChild(editBtn);
                actionCell.appendChild(saveBtn);
                actionCell.appendChild(deleteBtn);
            });
        }
        renderTransactions();

        document.getElementById("addTransactionBtn").addEventListener("click", function () {
            let description = document.getElementById("description").value.trim();
            let amount = parseFloat(document.getElementById("amount").value);

            if (!description || isNaN(amount)) {
                alert("Vui lòng nhập thông tin hợp lệ!");
                return;
            }

            balance += amount;
            transactions.push({ description, amount });

            localStorage.setItem(`balance_${username}`, balance);
            localStorage.setItem(`transactions_${username}`, JSON.stringify(transactions));

            balanceDisplay.textContent = balance.toLocaleString() + " VND";
            updateRemaining();
            renderTransactions();

            document.getElementById("description").value = "";
            document.getElementById("amount").value = "";
        });

        document.getElementById("logoutBtn").addEventListener("click", function () {
            sessionStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });

        // Xử lý ngân sách
        document.getElementById("setBudgetBtn").addEventListener("click", function () {
            let newBudget = parseFloat(budgetInput.value);
            if (isNaN(newBudget) || newBudget < 0) {
                alert("Vui lòng nhập số ngân sách hợp lệ!");
                return;
            }
            budget = newBudget;
            localStorage.setItem(`budget_${username}`, budget);
            updateRemaining();
        });

        function updateRemaining() {
            let remaining = budget - balance;
            remainingDisplay.textContent = remaining.toLocaleString() + " VND";
        }
    }
});
