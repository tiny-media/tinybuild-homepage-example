// Global application state - using reactive objects instead of runes for global scope
import { writable } from 'svelte/store';

// Create writable stores
export const appState = writable({
  user: null,
  theme: (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) || 'light',
  counters: 0,
  totalClicks: 0,
  pageVisits: [],
  lastActivity: null
});

// Auto-sync theme to localStorage
if (typeof window !== 'undefined') {
  appState.subscribe((state) => {
    localStorage.setItem('theme', state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
  });
}

// Helper functions
export function updateTheme(newTheme) {
  appState.update(state => ({
    ...state,
    theme: newTheme
  }));
}

export function incrementCounter() {
  appState.update(state => ({
    ...state,
    totalClicks: state.totalClicks + 1,
    lastActivity: new Date().toISOString()
  }));
}

export function visitPage(pageName) {
  appState.update(state => ({
    ...state,
    pageVisits: [...state.pageVisits, {
      page: pageName,
      timestamp: new Date().toISOString()
    }]
  }));
}