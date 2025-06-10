<script lang="ts">
    import { auth, type User } from '$lib/stores/auth';
    import { api } from '$lib/api/client';
    import { goto } from '$app/navigation';
    import {
        Button,
        Card,
        Input,
        Label,
        Alert,
        Spinner,
        Helper
    } from 'flowbite-svelte';

    // Reactive state with $state
    let login = $state('');
    let password = $state('');
    let error = $state('');
    let loading = $state(false);
    let showPassword = $state(false);

    // Derived state with $derived
    let loginValid = $derived(!login || /^[a-zA-Z0-9_-]{3,20}$/.test(login));
    let passwordValid = $derived(!password || password.length >= 3);

    async function loginUser(event: SubmitEvent) {
        event.preventDefault();

        if (!login || !password) {
            error = 'Заполните все поля';
            return;
        }

        if (!loginValid) {
            error = 'Введите корректный логин (3-20 символов, буквы, цифры, _, -)';
            return;
        }

        if (!passwordValid) {
            error = 'Пароль должен содержать минимум 3 символа';
            return;
        }

        loading = true;
        error = '';

        try {
            // Specify the User type for the api.post response
            const user = await api.post<User>('/employee/auth/login', { login, password });
            auth.setUser(user);
            goto('/dashboard');
        } catch (err: any) {
            // Handle APIError from APIClient
            error = err.message || 'Неверный логин или пароль';
            // Note: The APIClient already handles 401 redirect to /login
        } finally {
            loading = false;
        }
    }

    function togglePassword() {
        showPassword = !showPassword;
    }
</script>

<svelte:head>
    <title>Вход - RedLine App</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
    <div class="w-full max-w-md">
        <Card class="w-full shadow-lg dark:shadow-gray-800 transition-all p-6 md:p-8" size="lg">
            <!-- Заголовок формы -->
            <div class="text-center mb-6">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Redline Works</h1>
                <p class="text-gray-600 dark:text-gray-400 transition-colors">Войдите в свой аккаунт для продолжения</p>
            </div>

            <!-- Алерт с ошибкой -->
            {#if error}
                <Alert color="red" class="mb-4">
                    <span class="font-medium">Ошибка!</span> {error}
                </Alert>
            {/if}

            <!-- Форма -->
            <form onsubmit={loginUser} class="space-y-6">
                <!-- Логин -->
                <div>
                    <Label for="login" class="mb-2 text-gray-900 dark:text-white">Логин</Label>
                    <Input
                            id="login"
                            type="text"
                            bind:value={login}
                            placeholder="Введите логин"
                            required
                            disabled={loading}
                            color={!loginValid && login ? 'red' : undefined}
                            class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {#if !loginValid && login}
                        <Helper class="mt-1" color="red">
                            Введите корректный логин (3-20 символов, буквы, цифры, _, -)
                        </Helper>
                    {/if}
                </div>

                <!-- Пароль -->
                <div>
                    <Label for="password" class="mb-2 text-gray-900 dark:text-white">Пароль</Label>
                    <div class="relative">
                        <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                bind:value={password}
                                placeholder="Введите пароль"
                                required
                                disabled={loading}
                                color={!passwordValid && password ? 'red' : undefined}
                                class="dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                        />
                        <button
                                type="button"
                                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-100 transition-colors"
                                onclick={togglePassword}
                                disabled={loading}
                        >
                            {#if showPassword}
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                            {:else}
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            {/if}
                        </button>
                    </div>
                    {#if !passwordValid && password}
                        <Helper class="mt-1" color="red">
                            Пароль должен содержать минимум 3 символа
                        </Helper>
                    {/if}
                </div>

                <!-- Забыли пароль -->
                <div class="flex justify-end">
                    <a href="/forgot-password" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline transition-colors">
                        Забыли пароль?
                    </a>
                </div>

                <!-- Кнопка входа -->
                <div class="pt-1">
                    <Button
                            type="submit"
                            class="w-full"
                            disabled={loading || !loginValid || !passwordValid}
                            size="lg"
                    >
                        {#if loading}
                            <Spinner class="me-3" size="4" />
                            Вход...
                        {:else}
                            Войти в аккаунт
                        {/if}
                    </Button>
                </div>
            </form>
        </Card>
    </div>
</div>