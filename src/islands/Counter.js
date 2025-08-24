import { mount } from 'svelte';
import Counter from './Counter.svelte';

// is-land expects this function to be available
export default function(target, props = {}) {
  return mount(Counter, { 
    target, 
    props 
  });
}