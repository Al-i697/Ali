/* Small helpers. Every page still works if this file fails to load. */
(function () {
  "use strict";

  var fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // + / - buttons around a number box
  document.querySelectorAll(".stepper").forEach(function (box) {
    var input = box.querySelector("input");
    box.querySelectorAll("button[data-step]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var min = parseInt(input.min || "0", 10), max = parseInt(input.max || "99", 10);
        var next = (parseInt(input.value || "0", 10) || 0) + parseInt(btn.dataset.step, 10);
        input.value = Math.max(min, Math.min(max, next));
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
  });

  // Live total for the order and delivery forms (the server recalculates it anyway)
  document.querySelectorAll("[data-calc]").forEach(function (form) {
    var rows = form.querySelectorAll("[data-price]");
    var totalEls = form.querySelectorAll("[data-total]");
    var debtEl = form.querySelector("[data-debt]");
    var partial = form.querySelector("[data-partial]");
    var paidInput = form.querySelector("input[name=paid_amount]");

    function mode() {
      var r = form.querySelector("input[name=pay_mode]:checked");
      return r ? r.value : null;
    }
    function total() {
      var t = 0;
      rows.forEach(function (row) {
        var q = parseInt(row.querySelector("input.qty-input").value || "0", 10) || 0;
        t += q * parseFloat(row.dataset.price);
      });
      return t;
    }
    function update() {
      var t = total();
      totalEls.forEach(function (el) { el.textContent = fmt.format(t); });
      if (partial) partial.hidden = mode() !== "partial";
      form.querySelectorAll("[data-paid-only]").forEach(function (el) { el.hidden = mode() === "none"; });
      if (debtEl) {
        var paid = mode() === "full" ? t : mode() === "none" ? 0 : Math.min(parseFloat(paidInput && paidInput.value) || 0, t);
        var owed = Math.max(t - paid, 0);
        debtEl.textContent = fmt.format(owed);
        debtEl.closest("[data-debt-line]").classList.toggle("is-owed", owed > 0);
      }
    }
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    update();
  });

  // Ask before anything destructive
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-confirm]");
    if (el && !window.confirm(el.dataset.confirm)) e.preventDefault();
  });

  // One tap = one record: block double-submits on forms that write money
  document.querySelectorAll("form[data-once]").forEach(function (form) {
    form.addEventListener("submit", function () {
      requestAnimationFrame(function () {
        form.querySelectorAll("button[type=submit], button:not([type])").forEach(function (b) { b.disabled = true; });
      });
    });
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) document.querySelectorAll("form[data-once] button").forEach(function (b) { b.disabled = false; });
  });
})();
