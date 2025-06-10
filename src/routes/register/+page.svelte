<script lang="ts">
    import { auth } from '$lib/stores/auth';
    import { API_URL, fetchConfig } from '$lib/config';
    import { goto } from '$app/navigation';

    let name = '';
    let login = '';
    let password = '';
    let confirmPassword = '';
    let error = '';
    let loading = false;

	async function register(event: SubmitEvent) {
		event.preventDefault();

        // Валидация
        if (!name || !login || !password || !confirmPassword) {
            error = 'Заполните все поля';
            return;
        }

        if (password !== confirmPassword) {
            error = 'Пароли не совпадают';
            return;
        }

        if (password.length < 6) {
            error = 'Пароль должен содержать минимум 6 символов';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                ...fetchConfig,
                body: JSON.stringify({ name, login, password })
            });

            if (response.ok) {
                const user = await response.json();
                auth.setUser(user);
                goto('/dashboard');
            } else {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    error = errorJson.message || 'Ошибка регистрации';
                } catch {
                    error = errorText || 'Ошибка регистрации';
                }
            }
        } catch (err) {
            error = 'Ошибка сети. Проверьте подключение.';
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Регистрация - RedLine App</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">Создать аккаунт</h2>
        </div>

		<form onsubmit={register} class="space-y-6">
            {#if error}
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            {/if}

            <div>
                <label for="name" class="block text-sm font-medium text-gray-700">
                    Имя
                </label>
                <input
                        id="name"
                        type="text"
                        bind:value={name}
                        required
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Введите имя"
                />
            </div>

            <div>
                <label for="login" class="block text-sm font-medium text-gray-700">
                    Логин
                </label>
                <input
                    id="login"
                    type="text"
                    bind:value={login}
                        required
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите логин"
                />
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">
                    Пароль
                </label>
                <input
                        id="password"
                        type="password"
                        bind:value={password}
                        required
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Минимум 6 символов"
                />
            </div>

            <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                    Подтвердите пароль
                </label>
                <input
                        id="confirmPassword"
                        type="password"
                        bind:value={confirmPassword}
                        required
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Повторите пароль"
                />
            </div>

            <button
                    type="submit"
                    disabled={loading}
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            <div class="text-center">
                <p class="text-sm text-gray-600">
                    Уже есть аккаунт?
                    <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
                        Войти
                    </a>
                </p>
            </div>
        </form>
    </div>
</div>