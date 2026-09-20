(() => {
	"use strict";

	const status = document.getElementById("dashboard-status");
	const summary = document.getElementById("summary-grid");
	const content = document.getElementById("dashboard-content");

	function send(message) {
		return new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(message, (response) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
					return;
				}
				if (!response || !response.success) {
					reject(new Error("PageDelta returned no data."));
					return;
				}
				resolve(response.data);
			});
		});
	}

	function listOrEmpty(value) {
		return Array.isArray(value) ? value : [];
	}

	function addItem(container, title, meta) {
		const item = document.createElement("article");
		item.className = "item";
		const itemTitle = document.createElement("div");
		itemTitle.className = "item-title";
		itemTitle.textContent = title || "Untitled";
		const itemMeta = document.createElement("div");
		itemMeta.className = "item-meta";
		itemMeta.textContent = meta || "No additional details";
		item.append(itemTitle, itemMeta);
		container.appendChild(item);
	}

	function showEmpty(container, message) {
		container.textContent = "";
		const empty = document.createElement("p");
		empty.className = "empty";
		empty.textContent = message;
		container.appendChild(empty);
	}

	function formatDate(value) {
		if (!value) return "Date not available";
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
	}

	async function load() {
		const [pages, actions] = await Promise.all([
			send({ type: "GET_ALL_PAGES" }),
			send({ type: "GET_ACTIONS", options: {} })
		]);
		const pageEntries = Object.values(pages && typeof pages === "object" ? pages : {});
		const actionEntries = listOrEmpty(actions);
		const snapshotGroups = await Promise.all(pageEntries.map((page) => send({ type: "GET_SNAPSHOTS", url: page.url })));
		const snapshots = snapshotGroups.reduce((total, group) => total + (Array.isArray(group) ? group.length : 0), 0);

		document.getElementById("page-total").textContent = String(pageEntries.length);
		document.getElementById("action-total").textContent = String(actionEntries.filter((action) => action.status === "pending").length);
		document.getElementById("snapshot-total").textContent = String(snapshots);
		document.getElementById("history-count").textContent = String(pageEntries.length);

		const scheduleList = document.getElementById("schedule-list");
		const pending = actionEntries.filter((action) => action.status !== "completed" && action.status !== "dismissed").slice(0, 8);
		document.getElementById("schedule-count").textContent = String(pending.length);
		if (!pending.length) showEmpty(scheduleList, "No upcoming deadlines or actions yet.");
		pending.forEach((action) => addItem(scheduleList, action.title, `${action.importance || "medium"} priority · ${action.deadline ? formatDate(action.deadline) : "No date"}`));

		const trackedList = document.getElementById("tracked-list");
		showEmpty(trackedList, "No tracked websites.");

		const historyList = document.getElementById("history-list");
		if (!pageEntries.length) showEmpty(historyList, "No saved page history yet.");
		pageEntries.sort((a, b) => (b.lastVisited || 0) - (a.lastVisited || 0)).slice(0, 12).forEach((page) => addItem(historyList, page.title || "Untitled page", `${page.hostname || page.url || "Unknown website"} · Last analyzed ${formatDate(page.updatedAt || page.lastVisited)}`));

		status.hidden = true;
		summary.hidden = false;
		content.hidden = false;
	}

	load().catch(() => {
		status.textContent = "Couldn't load your dashboard. Try again.";
		status.className = "status error";
	});
})();
