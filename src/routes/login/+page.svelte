<script lang="ts">
    import { auth } from '$lib/stores/auth';
    import { API_URL, fetchConfig } from '$lib/config';
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let error = '';
    let loading = false;

	async function login(event: SubmitEvent) {
		event.preventDefault();

        if (!email || !password) {
            error = 'Заполните все поля';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                ...fetchConfig,
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const user = await response.json();
                auth.setUser(user);
                goto('/dashboard');
            } else {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    error = errorJson.message || 'Ошибка входа';
                } catch {
                    error = errorText || 'Ошибка входа';
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
    <title>Вход - RedLine App</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full space-y-8">
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">Вход в аккаунт</h2>
        </div>

		<form onsubmit={login} class="space-y-6">
            {#if error}
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            {/if}

            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                        id="email"
                        type="email"
                        bind:value={email}
                        required
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Введите email"
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
                        placeholder="Введите пароль"
                />
            </div>

            <button
                    type="submit"
                    disabled={loading}
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? 'Вход...' : 'Войти'}
            </button>

            <div class="text-center">
                <p class="text-sm text-gray-600">
                    Нет аккаунта?
                    <a href="/register" class="font-medium text-blue-600 hover:text-blue-500">
                        Зарегистрируйтесь
                    </a>
                </p>
            </div>
        </form>
    </div>
</div>