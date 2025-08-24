import { mount } from "svelte";
import Greeting from "./Greeting.svelte";

// is-land expects this function to be available
export default function (target, props = {}) {
	return mount(Greeting, {
		target,
		props,
	});
}
