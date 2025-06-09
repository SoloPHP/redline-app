<script lang="ts">
    import { auth } from '$lib/stores/auth';
    import { API_URL, fetchConfig } from '$lib/config';
    import { goto } from '$app/navigation';
    import {
        Button,
        Card,
        Input,
        Label,
        Alert,
        Spinner,
        Checkbox,
        Helper
    } from 'flowbite-svelte';

    let email = '';
    let password = '';
    let rememberMe = false;
    let error = '';
    let loading = false;
    let showPassword = false;

    // Валидация email
    let emailValid = true;
    $: emailValid = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Валидация пароля
    let passwordValid = true;
    $: passwordValid = !password || password.length >= 3;

    async function login(event: SubmitEvent) {
        event.preventDefault();

        if (!email || !password) {
            error = 'Заполните все поля';
            return;
        }

        if (!emailValid) {
            error = 'Введите корректный email адрес';
            return;
        }

        if (!passwordValid) {
            error = 'Пароль должен содержать минимум 3 символа';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                ...fetchConfig,
                body: JSON.stringify({ email, password, rememberMe })
            });

            if (response.ok) {
                const user = await response.json();
                auth.setUser(user);
                goto('/dashboard');
            } else {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    error = errorJson.message || 'Неверный email или пароль';
                } catch {
                    error = errorText || 'Неверный email или пароль';
                }
            }
        } catch (err) {
            error = 'Ошибка подключения к серверу. Проверьте интернет-соединение.';
        } finally {
            loading = false;
        }
    }

    function fillDemo() {
        email = 'demo@example.com';
        password = 'demo123';
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
        <!-- Логотип/Заголовок приложения -->
        <div class="text-center mb-8">
            <div class="mx-auto w-16 h-16 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center mb-4 transition-colors">
                <span class="text-white text-2xl font-bold">RL</span>
            </div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white transition-colors">RedLine App</h1>
        </div>

        <Card class="w-full shadow-lg dark:shadow-gray-800 transition-all p-6 md:p-8" size="lg">
            <!-- Заголовок формы -->
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Вход в аккаунт</h2>
                <p class="text-gray-600 dark:text-gray-400 transition-colors">Войдите в свой аккаунт для продолжения</p>
            </div>

            <!-- Демо кнопка -->
            <div class="mb-4">
                <Button
                        color="light"
                        class="w-full text-sm"
                        size="sm"
                        onclick={fillDemo}
                        disabled={loading}
                >
                    🚀 Заполнить демо данными
                </Button>
            </div>

            <!-- Алерт с ошибкой -->
            {#if error}
                <Alert color="red" class="mb-4">
                    <span class="font-medium">Ошибка!</span> {error}
                </Alert>
            {/if}

            <!-- Форма -->
            <form on:submit={login} class="space-y-6">
                <!-- Email -->
                <div>
                    <Label for="email" class="mb-2 text-gray-900 dark:text-white">Email адрес</Label>
                    <Input
                            id="email"
                            type="email"
                            bind:value={email}
                            placeholder="your@email.com"
                            required
                            disabled={loading}
                            color={!emailValid && email ? 'red' : undefined}
                            class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {#if !emailValid && email}
                        <Helper class="mt-1" color="red">
                            Введите корректный email адрес
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
                                on:click={togglePassword}
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

                <!-- Запомнить меня и забыли пароль -->
                <div class="flex items-center justify-between py-2">
                    <Checkbox bind:checked={rememberMe} disabled={loading} class="text-gray-900 dark:text-white">
                        Запомнить меня
                    </Checkbox>
                    <a href="/forgot-password" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline transition-colors">
                        Забыли пароль?
                    </a>
                </div>

                <!-- Кнопка входа -->
                <div class="pt-2">
                    <Button
                            type="submit"
                            class="w-full"
                            disabled={loading || !emailValid || !passwordValid}
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

            <!-- Разделитель -->
            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">или</span>
                </div>
            </div>

            <!-- Ссылка на регистрацию -->
            <div class="text-center">
                <p class="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    Нет аккаунта?
                    <a
                            href="/register"
                            class="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline transition-colors"
                    >
                        Создать новый аккаунт
                    </a>
                </p>
            </div>
        </Card>

        <!-- Дополнительная информация -->
        <div class="text-center mt-6 text-xs text-gray-500 dark:text-gray-400 transition-colors">
            Нажимая "Войти", вы соглашаетесь с нашими
            <a href="/terms" class="text-blue-600 dark:text-blue-400 hover:underline transition-colors">условиями использования</a>
        </div>
    </div>
</div>