let exchangeRates = {};

async function fetchExchangeRates() {
    try {
        const response = await fetch("https://v6.exchangerate-api.com/v6/3c75a71ca4d9c20b66f8d8db/latest/INR");
        const data = await response.json();
        exchangeRates = data.conversion_rates;
        updateCurrency(); // Update values after fetching
        updateCurrency2(); // Update values after fetching
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        alert("Failed to load exchange rates. Please try again later.");
    }
}

function updateCurrency() {
    const currency = document.getElementById("currencySelect").value;
    const rate = exchangeRates[currency] || 1; // Default to 1 if rate not found
    document.querySelectorAll(".amount").forEach(element => {
        const baseValue = element.getAttribute("data-inr");
        element.innerText = `${(baseValue * rate).toFixed(2)} ${currency}`;
    });
}
function updateCurrency2() {
    const currency = document.getElementById("currencySelect2").value;
    const rate = exchangeRates[currency] || 1; // Default to 1 if rate not found
    document.querySelectorAll(".amount2").forEach(element => {
        const baseValue = element.getAttribute("data-inr2");
        element.innerText = `${(baseValue * rate).toFixed(2)} ${currency}`;
    });
}

window.onload = fetchExchangeRates;

function redirectToDonationBox(button) {
    // Get the corresponding amount from the same row
    const amountElement = button.closest('tr').querySelector('.amount');
    const amount = amountElement.innerText.split(" ")[0]; // Extract only the number part
    const selectedCurrency = document.getElementById('currencySelect').value;
    const donationFor = 'Sponsor a Student'; // Default value for donationFor
    window.location.href = `donationBox0.html?amount=${amount}&currency=${selectedCurrency}&donationFor=${donationFor}`
}

function redirectCustomAmount() {
    const customAmount = document.getElementById('customAmount').value;
    const selectedCurrency = document.getElementById('currencySelect').value;
    const donationFor = 'Sponsor a Student'; // Default value for donationFor
    if (customAmount && customAmount > 0) {
       window.location.href = `donationBox0.html?amount=${customAmount}&currency=${selectedCurrency}&donationFor=${donationFor}`
    } else {
        alert("Please enter a valid amount!");
    }
}
function redirectToDonationBox2(button) {
    // Get the corresponding amount from the same row
    const amountElement = button.closest('tr').querySelector('.amount2');
    const amount = amountElement.innerText.split(" ")[0]; // Extract only the number part
    const selectedCurrency = document.getElementById('currencySelect2').value;
    const donationFor = 'I Support'; // Default value for donationFor
    window.location.href = `donationBox01.html?amount=${amount}&currency=${selectedCurrency}&donationFor=${donationFor}`
}

function redirectCustomAmount2() {
    const customAmount = document.getElementById('customAmount2').value;
    const selectedCurrency = document.getElementById('currencySelect2').value;
    const donationFor = 'I Support'; // Default value for donationFor
    if (customAmount && customAmount > 0) {
        window.location.href = `donationBox0.html?amount=${customAmount}&currency=${selectedCurrency}&donationFor=${donationFor}`
    } else {
        alert("Please enter a valid amount!");
    }
}

function toggleMenu() {
    document.getElementById("navLinks").classList.toggle("show");
  }

  