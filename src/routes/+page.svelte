<script lang="ts">
    import { auth } from '$lib/stores/auth';
</script>

<div class="max-w-4xl mx-auto py-12 px-4">
    <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
            Добро пожаловать в RedLine App
        </h1>

        {#if $auth.isAuthenticated}
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 transition-colors">
                Привет, {$auth.user?.name}! Рады видеть вас снова.
            </p>
            <a
                    href="/dashboard"
                    class="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 text-lg transition-colors"
            >
                Перейти в панель управления
            </a>
        {:else}
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 transition-colors">
                Войдите в систему для доступа к функциям приложения.
            </p>
            <div class="space-x-4">
                <a
                        href="/login"
                        class="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 text-lg transition-colors"
                >
                    Войти
                </a>
                <a
                        href="/register"
                        class="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-lg transition-colors"
                >
                    Регистрация
                </a>
            </div>
        {/if}
    </div>
</div>