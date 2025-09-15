<script>
import { appState, incrementCounter } from "./app-state.svelte.js";

const { initialCount = 0 } = $props();

// Load persisted count from localStorage or use initialCount
let count = $state(
	typeof localStorage !== "undefined"
		? parseInt(
				localStorage.getItem("counterValue") || initialCount.toString(),
				10,
			)
		: initialCount,
);

// Cross-tab sync and persistence using proper Svelte 5 patterns
let channel;
let isReceivingUpdate = false;

onMount(() => {
	if (typeof window !== "undefined") {
		channel = new BroadcastChannel("counter-sync");

		// Listen for updates from other tabs
		const handleMessage = (event) => {
			if (event.data.type === "COUNTER_UPDATE" && !isReceivingUpdate) {
				isReceivingUpdate = true;
				count = parseInt(event.data.value, 10);
				isReceivingUpdate = false;
			}
		};

		channel.addEventListener("message", handleMessage);
	}
});

onDestroy(() => {
	if (channel) {
		channel.close();
	}
});

// Persist and sync on count changes
$effect(() => {
	if (typeof localStorage !== "undefined" && !isReceivingUpdate) {
		localStorage.setItem("counterValue", count.toString());

		if (channel) {
			channel.postMessage({
				type: "COUNTER_UPDATE",
				value: count.toString(),
			});
		}
	}
});

// Track when this component mounts - use onMount to avoid reactivity loops
import { onDestroy, onMount } from "svelte";

onMount(() => {
	appState.counters++;
	console.log("🟦 Svelte: Counter component mounted");
});

onDestroy(() => {
	appState.counters--;
	console.log("🟦 Svelte: Counter component unmounted");
});

function increment() {
	count++;
	incrementCounter(); // Update global state
}

function decrement() {
	count--;
	incrementCounter(); // Update global state
}
</script>

<article class="card">
  <header class="card-header">
    <h3>Svelte Counter Island</h3>
  </header>
  <div class="text-center" style="margin: var(--space-md) 0;">
    <p class="text-2xl">Count: <strong>{count}</strong></p>
    <div class="flex items-center justify-center" style="gap: var(--space-sm); margin-top: var(--space-md);">
      <button onclick={decrement} aria-label="Decrement counter">-</button>
      <span class="badge badge-info">Svelte 5</span>
      <button onclick={increment} aria-label="Increment counter">+</button>
    </div>
  </div>
  <footer class="card-footer">
    <small class="text-sm">Cross-tab sync • LocalStorage persist • Progressive enhancement</small>
  </footer>
</article>

