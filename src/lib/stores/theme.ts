import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'auto';

function createThemeStore() {
	// Получаем сохраненную тему или используем 'auto' по умолчанию
	const savedTheme = browser ? localStorage.getItem('theme') as Theme : 'auto';
	const { subscribe, set, update } = writable<Theme>(savedTheme || 'auto');

	return {
		subscribe,

		// Установка темы
		setTheme: (theme: Theme) => {
			if (browser) {
				localStorage.setItem('theme', theme);
				applyTheme(theme);
			}
			set(theme);
		},

		// Переключение между светлой и темной темой
		toggle: () => {
			update(currentTheme => {
				const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
				if (browser) {
					localStorage.setItem('theme', newTheme);
					applyTheme(newTheme);
				}
				return newTheme;
			});
		},

		// Инициализация темы
		init: () => {
			if (browser) {
				const savedTheme = localStorage.getItem('theme') as Theme || 'auto';
				applyTheme(savedTheme);
				set(savedTheme);
			}
		}
	};
}

// Применение темы к DOM
function applyTheme(theme: Theme) {
	if (!browser) return;

	const root = document.documentElement;

	// Удаляем все классы темы
	root.classList.remove('light', 'dark');

	if (theme === 'auto') {
		// Определяем системную тему
		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		root.classList.add(systemTheme);
	} else {
		root.classList.add(theme);
	}
}

// Слушаем изменения системной темы
if (browser) {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
		const currentTheme = localStorage.getItem('theme');
		if (currentTheme === 'auto' || !currentTheme) {
			applyTheme('auto');
		}
	});
}

export const theme = createThemeStore();