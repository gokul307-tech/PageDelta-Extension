(() => {
	"use strict";

	const status = document.getElementById("popup-status");
	const overview = document.getElementById("page-overview");
	const pageTitle = document.getElementById("page-title");
	const pageUrl = document.getElementById("page-url");
	const pagePurpose = document.getElementById("page-purpose");
	const fieldCount = document.getElementById("field-count");
	const deadlineCount = document.getElementById("deadline-count");

	function send(message) {
		return new Promise((resolve) => {
			chrome.runtime.sendMessage(message, (response) => {
				if (chrome.runtime.lastError) {
					resolve(null);
					return;
				}
				resolve(
					response &&
					response.success
						? response.data
						: null
				);
			});
		});
	}

	function showError(message) {
		status.textContent = message;
		status.className = "status error";
	}

	async function load() {
		const tab = await send({ type: "GET_ACTIVE_TAB" });
		if (!tab || !tab.id) {
			showError("This page cannot be analyzed.");
			return;
		}
		const analysis = await send({ type: "GET_PAGE_ANALYSIS", tabId: tab.id });
		if (!analysis) {
			status.textContent = "Open PageDelta on this page to analyze it.";
			return;
		}
		const fields = Array.isArray(analysis.fields) ? analysis.fields : [];
		const deadlines = Array.isArray(analysis.deadlines) ? analysis.deadlines : [];
		pageTitle.textContent = analysis.title || "Current webpage";
		pageUrl.textContent = analysis.url || tab.url || "";
		pagePurpose.textContent = analysis.purpose?.purpose || "General information";
		fieldCount.textContent = `${fields.length} field${fields.length === 1 ? "" : "s"}`;
		deadlineCount.textContent = String(deadlines.length);
		status.hidden = true;
		overview.hidden = false;
	}

	document.getElementById("review-button").addEventListener("click", async () => {
		await send({ type: "SHOW_PANEL" });
		window.close();
	});
	document.getElementById("dashboard-button").addEventListener("click", async () => {
		await send({ type: "OPEN_DASHBOARD" });
		window.close();
	});
	load().catch(() => showError("Couldn't load this page. Try again."));
})();
