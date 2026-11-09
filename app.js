// PLAN PRICES
const prices = {
    Starter: { monthly: 199, yearly: 1910 },
    Pro: { monthly: 499, yearly: 4790 },
    Team: { monthly: 999, yearly: 9590 }
};

const planFeatures = {
    Starter: {
        description: "A simple starting point for individuals and personal projects.",
        features: [
            "Basic dashboard",
            "Up to 3 projects",
            "Email support"
        ]
    },
    Pro: {
        description: "Extra tools for professionals who need more flexibility.",
        features: [
            "Everything in Starter",
            "Advanced analytics",
            "Unlimited projects",
            "Priority support"
        ]
    },
    Team: {
        description: "Collaboration features for growing teams.",
        features: [
            "Everything in Pro",
            "Team collaboration",
            "Custom workspace",
            "Dedicated support"
        ]
    }
};

let billingType = "monthly";
let selectedPlan = "";
let couponApplied = false;
let referralApplied = false;

const $ = id => document.getElementById(id);

const money = value =>
    `₹${Math.round(value).toLocaleString("en-IN")}`;


// TOAST MESSAGE
function showToast(message) {
    const toast = $("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}


// PRICE CALCULATION
function basePrice(plan = selectedPlan) {
    return plan && prices[plan]
        ? prices[plan][billingType]
        : 0;
}

function discountAmounts() {
    const base = basePrice();

    const coupon = couponApplied
        ? Math.round(base * 0.10)
        : 0;

    const referral = referralApplied
        ? Math.round((base - coupon) * 0.05)
        : 0;

    const total = Math.max(
        0,
        base - coupon - referral
    );

    return {
        base,
        coupon,
        referral,
        total
    };
}


// CHECKOUT SUMMARY
function updateCheckout() {
    const button = $("checkoutButton");

    if (!selectedPlan) {
        $("summaryPlan").textContent = "No plan selected";
        $("summaryBilling").textContent = "Select a plan";
        $("summaryBase").textContent = "—";
        $("summaryCoupon").textContent = "—";
        $("summaryReferral").textContent = "—";
        $("summaryPrice").textContent = "—";

        button.disabled = true;

        return;
    }

    const d = discountAmounts();

    $("summaryPlan").textContent = selectedPlan;

    $("summaryBilling").textContent =
        billingType === "monthly"
            ? "Monthly"
            : "Yearly";

    $("summaryBase").textContent = money(d.base);

    $("summaryCoupon").textContent =
        couponApplied
            ? `−${money(d.coupon)}`
            : money(0);

    $("summaryReferral").textContent =
        referralApplied
            ? `−${money(d.referral)}`
            : money(0);

    $("summaryPrice").textContent = money(d.total);

    button.disabled = false;
}


// MONTHLY / YEARLY BILLING
function updatePrices() {
    ["Starter", "Pro", "Team"].forEach(plan => {

        const amount = prices[plan][billingType];

        const key = plan.toLowerCase();

        $(key + "Price").textContent = money(amount);

        $(key + "Total").textContent =
            billingType === "yearly"
                ? `${money(amount)} billed yearly`
                : `${money(amount * 12)} for 12 months`;

        $(key + "Savings").textContent =
            billingType === "yearly"
                ? "Save around 20% yearly"
                : "";
    });

    document.querySelectorAll(".billing-button")
        .forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.billing === billingType
            );
        });

    updateCheckout();
    updateDuration();
}

document.querySelectorAll(".billing-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            billingType = button.dataset.billing;

            updatePrices();

            if (selectedPlan) {
                addHistory();
            }
        });
    });


// PLAN SELECTION
document.querySelectorAll("[data-select]")
    .forEach(button => {

        button.addEventListener("click", () => {

            selectedPlan = button.dataset.select;

            document.querySelectorAll("[data-plan-card]")
                .forEach(card => {
                    card.classList.toggle(
                        "selected-card",
                        card.dataset.planCard === selectedPlan
                    );
                });

            updateCheckout();
            addHistory();

            $("checkout").scrollIntoView({
                behavior: "smooth"
            });
        });
    });

const savedTheme = localStorage.getItem("priceflow-theme") || "dark";

document.documentElement.setAttribute("data-theme", savedTheme);

$("themeToggle").textContent =
    savedTheme === "dark" ? "☀️ Light mode" : "🌙 Dark mode";
// DARK / LIGHT MODE
$("themeToggle").addEventListener("click", () => {

    const dark =
        document.documentElement.getAttribute("data-theme") !== "dark";

    document.documentElement.setAttribute(
        "data-theme",
        dark ? "dark" : "light"
    );

    $("themeToggle").textContent =
        dark ? "☀️ Light mode" : "🌙 Dark mode";

    localStorage.setItem(
        "priceflow-theme",
        dark ? "dark" : "light"
    );
});



// CHECKOUT DEMO
$("checkoutButton").addEventListener("click", () => {
    showToast("Demo only — no payment was processed.");
});

$("year").textContent = new Date().getFullYear();


// FEATURE 1: SMART PLAN RECOMMENDATION
$("getRecommendation").addEventListener("click", () => {

    const raw = $("recommendMembers").value;
    const members = Number(raw);

    const result = $("recommendationResult");

    if (
        !raw.trim() ||
        !Number.isInteger(members) ||
        members < 1 ||
        members > 500
    ) {
        result.textContent =
            "Please enter a whole number between 1 and 500.";

        return;
    }

    let plan = "Starter";

    if (
        $("needCollaboration").checked ||
        members >= 10
    ) {
        plan = "Team";
    }

    else if (
        $("needAnalytics").checked ||
        $("needWorkspace").checked ||
        members > 1
    ) {
        plan = "Pro";
    }

    result.textContent =
        `Your recommended plan is ${plan}!`;

    document.querySelector(
        `[data-select="${plan}"]`
    ).click();
});


// FEATURE 2: CURRENCY CONVERTER
function convertCurrency() {

    const amount = Math.max(
        0,
        Number($("currencyAmount").value) || 0
    );

    $("usdValue").textContent =
        `$${(amount / 83.2).toFixed(2)}`;

    $("eurValue").textContent =
        `€${(amount / 90.4).toFixed(2)}`;

    $("gbpValue").textContent =
        `£${(amount / 105.5).toFixed(2)}`;
}

$("currencyAmount").addEventListener(
    "input",
    convertCurrency
);


// FEATURE 3: TEAM SIZE CALCULATOR
function calculateTeamCost() {

    const raw = $("teamSize").value;
    const members = Number(raw);

    if (
        !raw.trim() ||
        !Number.isInteger(members) ||
        members < 1 ||
        members > 500
    ) {
        $("teamCost").textContent =
            "Enter 1–500 valid members";

        return;
    }

    $("teamCost").textContent = money(
        members * Number($("teamPlan").value)
    );
}

$("teamSize").addEventListener(
    "input",
    calculateTeamCost
);

$("teamPlan").addEventListener(
    "change",
    calculateTeamCost
);


// FEATURE 4: FEATURE DETAILS POPUP
function openFeatureModal(plan) {

    const data = planFeatures[plan];

    $("modalTitle").textContent = `${plan} plan`;

    $("modalDescription").textContent =
        data.description;

    $("modalFeatures").innerHTML =
        data.features
            .map(item => `<li>✓ ${item}</li>`)
            .join("");

    $("featureModal").classList.add("open");

    $("featureModal").setAttribute(
        "aria-hidden",
        "false"
    );
}

document.querySelectorAll("[data-feature]")
    .forEach(button => {

        button.addEventListener("click", () => {
            openFeatureModal(button.dataset.feature);
        });
    });

function closeModal() {

    $("featureModal").classList.remove("open");

    $("featureModal").setAttribute(
        "aria-hidden",
        "true"
    );
}

$("closeModal").addEventListener(
    "click",
    closeModal
);

$("featureModal").addEventListener("click", event => {

    if (event.target === $("featureModal")) {
        closeModal();
    }
});

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeModal();
    }
});


// FEATURE 5: WISHLIST
function getWishlist() {

    try {

        const value = JSON.parse(
            localStorage.getItem("priceflow-wishlist") || "[]"
        );

        return Array.isArray(value) ? value : [];

    } catch {
        return [];
    }
}

function renderWishlist() {

    const list = getWishlist();

    $("wishlistList").innerHTML = "";

    if (!list.length) {

        $("wishlistList").textContent =
            "No saved plans yet.";

        return;
    }

    list.forEach(plan => {

        const row = document.createElement("div");
        row.className = "saved-item";

        const label = document.createElement("strong");

        label.textContent =
            `${plan} — ${money(prices[plan][billingType])} (${billingType})`;

        const remove = document.createElement("button");

        remove.textContent = "Remove";

        remove.addEventListener("click", () => {

            localStorage.setItem(
                "priceflow-wishlist",
                JSON.stringify(
                    getWishlist().filter(item => item !== plan)
                )
            );

            renderWishlist();
        });

        row.append(label, remove);

        $("wishlistList").append(row);
    });
}

document.querySelectorAll("[data-save]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const plan = button.dataset.save;

            const list = getWishlist();

            if (list.includes(plan)) {

                showToast(`${plan} is already saved.`);

            } else {

                list.push(plan);

                localStorage.setItem(
                    "priceflow-wishlist",
                    JSON.stringify(list)
                );

                showToast(`${plan} saved to wishlist.`);
            }

            renderWishlist();
        });
    });

renderWishlist();


// FEATURE 6: PRICING HISTORY
function getHistory() {

    try {

        const value = JSON.parse(
            localStorage.getItem("priceflow-history") || "[]"
        );

        return Array.isArray(value) ? value : [];

    } catch {
        return [];
    }
}

function addHistory() {

    if (!selectedPlan) return;

    const d = discountAmounts();

    const entry = {
        plan: selectedPlan,
        billing: billingType,
        total: d.total,
        date: new Date().toLocaleString()
    };

    const list = getHistory();

    list.unshift(entry);

    localStorage.setItem(
        "priceflow-history",
        JSON.stringify(list.slice(0, 10))
    );

    renderHistory();
}

function renderHistory() {

    const list = getHistory();

    $("historyList").innerHTML = "";

    if (!list.length) {

        $("historyList").textContent =
            "No pricing history yet.";

        return;
    }

    list.forEach(item => {

        const row = document.createElement("div");
        row.className = "history-item";

        const details = document.createElement("span");

        details.textContent =
            `${item.plan} · ${item.billing} · ${money(item.total)} · ${item.date}`;

        row.append(details);

        $("historyList").append(row);
    });
}

$("clearHistory").addEventListener("click", () => {

    localStorage.removeItem("priceflow-history");

    renderHistory();
});

renderHistory();


// FEATURE 7: COUPON DISCOUNT
$("applyCoupon").addEventListener("click", () => {

    const code = $("couponInput").value.trim().toUpperCase();

    if (!selectedPlan) {

        $("couponMessage").textContent =
            "Choose a plan first.";

        return;
    }

    if (code !== "SAVE10") {

        couponApplied = false;

        $("couponMessage").textContent =
            "Invalid code. Try SAVE10.";

    } else {

        couponApplied = true;

        $("couponMessage").textContent =
            "SAVE10 applied — 10% discount!";
    }

    updateCheckout();
});


// REFERRAL DISCOUNT
$("applyReferral").addEventListener("click", () => {

    const code = $("referralInput").value.trim().toUpperCase();

    if (!selectedPlan) {

        $("referralMessage").textContent =
            "Choose a plan first.";

        return;
    }

    if (code !== "FRIEND5") {

        referralApplied = false;

        $("referralMessage").textContent =
            "Invalid code. Try FRIEND5.";

    } else {

        referralApplied = true;

        $("referralMessage").textContent =
            "FRIEND5 applied — extra 5% discount!";
    }

    updateCheckout();
});


// SUBSCRIPTION DURATION CALCULATOR
function updateDuration() {

    const plan = $("durationPlan").value;

    const raw = $("durationMonths").value;

    const months = Number(raw);

    if (
        !raw.trim() ||
        !Number.isInteger(months) ||
        months < 1 ||
        months > 60
    ) {
        $("durationCost").textContent =
            "Enter 1–60 months";

        $("durationNote").textContent =
            "Use a whole number of months.";

        return;
    }

    const monthlyEquivalent = prices[plan].monthly;

    const yearlyEquivalent = prices[plan].yearly / 12;

    const total =
        billingType === "yearly"
            ? Math.floor(months / 12) * prices[plan].yearly
              + (months % 12) * monthlyEquivalent
            : months * monthlyEquivalent;

    $("durationCost").textContent = money(total);

    $("durationNote").textContent =
        billingType === "yearly"
            ? `Yearly rate for complete 12-month periods; remaining months at monthly rate. (Approx. ${money(yearlyEquivalent)}/month for yearly periods.)`
            : "Monthly billing estimate.";
}

$("durationPlan").addEventListener(
    "change",
    updateDuration
);

$("durationMonths").addEventListener(
    "input",
    updateDuration
);


// FEATURE: DOWNLOAD PRICING PDF
$("downloadPdf").addEventListener("click", () => {

    showToast("Choose 'Save as PDF' in the print window.");

    window.print();
});


// INITIAL SETUP
updatePrices();
calculateTeamCost();
convertCurrency();
updateDuration();
renderWishlist();