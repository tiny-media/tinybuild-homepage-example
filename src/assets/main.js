// Main entry point for Vite processing
import "./styles/tokens.css";
import "@11ty/is-land/is-land.js";
import greetingInit from "../islands/Greeting.js";
import myawesomeInit from "../islands/MyAwesome.js";

import counterInit from "../islands/Counter.js";
// Register components globally for is-land
window.islandComponents = {
	counter: counterInit,
	greeting: greetingInit,
	myawesome: myawesomeInit,
};

Island.addInitType("component", async (island) => {
	const componentName = island.getAttribute("component");
	const propsAttr = island.getAttribute("props");
	const props = propsAttr ? JSON.parse(propsAttr) : {};

	if (window.islandComponents && window.islandComponents[componentName]) {
		// Clear placeholder content first
		island.innerHTML = "";
		// Then mount component
		window.islandComponents[componentName](island, props);
	}
});
