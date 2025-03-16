let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let balance = parseFloat(localStorage.getItem("balance")) || 0;
document.getElementById("balance").innerText = balance.toLocaleString();

// Thêm giao dịch
function addTransaction() {
    let description = document.getElementById("description").value.trim();
    let amount = parseFloat(document.getElementById("amount").value);

    if (!description || isNaN(amount) || amount === 0) {
        alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
        return;
    }

    if (amount < 0 && Math.abs(amount) > balance) {
        alert("Số dư không đủ!");
        return;
    }

    transactions.push({ description, amount });
    balance += amount;
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("balance", balance);

    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    renderTransactions();
}

// Xóa giao dịch
function deleteTransaction(index) {
    let amount = transactions[index].amount;
    balance -= amount;
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("balance", balance);
    renderTransactions();
}


// Hiển thị giao dịch
function renderTransactions() {
    document.getElementById("balance").innerText = balance.toLocaleString();
    let transactionList = document.getElementById("transactionList");
    transactionList.innerHTML = "";

    transactions.forEach((transaction, index) => {
        let row = `<tr>
            <td>${transaction.description}</td>
            <td class="${transaction.amount < 0 ? 'expense' : 'income'}">
                ${transaction.amount.toLocaleString()} VND
            </td>
            <td><button onclick="deleteTransaction(${index})">Xóa</button></td>
        </tr>`;
        transactionList.innerHTML += row;
    });
}

renderTransactions();
