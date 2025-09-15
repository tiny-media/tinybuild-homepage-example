// Global application state using Svelte 5 runes
export const appState = $state({
	user: null,
	theme:
		(typeof localStorage !== "undefined"
			? localStorage.getItem("theme")
			: null) || "light",
	counters: 0,
	totalClicks: parseInt(localStorage.getItem("totalClicks") || "0"),
	pageVisits: JSON.parse(localStorage.getItem("pageVisits") || "[]"),
	lastActivity: localStorage.getItem("lastActivity") || null,
});

// Cross-tab communication
let broadcastChannel;
let isReceivingBroadcast = false;

if (typeof window !== "undefined") {
	broadcastChannel = new BroadcastChannel("app-state-sync");

	// Listen for state updates from other tabs
	broadcastChannel.addEventListener("message", (event) => {
		const { type, data } = event.data;

		if (type === "STATE_UPDATE") {
			isReceivingBroadcast = true;
			// Update local state without triggering broadcast loop
			Object.assign(appState, data);
			console.log("🔄 State updated from another tab:", data);
			isReceivingBroadcast = false;
		}
	});
}

// Helper functions that also sync state
export function updateTheme(newTheme) {
	appState.theme = newTheme;
	syncToStorage();
}

export function incrementCounter() {
	appState.totalClicks++;
	appState.lastActivity = new Date().toISOString();
	syncToStorage();
}

export function visitPage(pageName) {
	appState.pageVisits.push({
		page: pageName,
		timestamp: new Date().toISOString(),
	});
	syncToStorage();
}

// Manual sync function
function syncToStorage() {
	if (typeof window !== "undefined" && !isReceivingBroadcast) {
		localStorage.setItem("theme", appState.theme);
		localStorage.setItem("totalClicks", appState.totalClicks.toString());
		localStorage.setItem("pageVisits", JSON.stringify(appState.pageVisits));
		localStorage.setItem("lastActivity", appState.lastActivity || "");

		document.documentElement.setAttribute("data-theme", appState.theme);

		if (broadcastChannel) {
			broadcastChannel.postMessage({
				type: "STATE_UPDATE",
				data: {
					theme: appState.theme,
					totalClicks: appState.totalClicks,
					pageVisits: appState.pageVisits,
					lastActivity: appState.lastActivity,
				},
			});

			// Also broadcast counter value changes
			broadcastChannel.postMessage({
				type: "COUNTER_UPDATE",
				data: localStorage.getItem("counterValue"),
			});
		}
	}
}
