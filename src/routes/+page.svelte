<script lang="ts">
    import { auth } from '$lib/stores/auth';
</script>

<div class="max-w-4xl mx-auto py-12 px-4">
    <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Добро пожаловать в RedLine App
        </h1>

        {#if $auth.isAuthenticated}
            <p class="text-lg text-gray-600 mb-8">
                Привет, {$auth.user?.name}! Рады видеть вас снова.
            </p>
            <a
                    href="/dashboard"
                    class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg"
            >
                Перейти в панель управления
            </a>
        {:else}
            <p class="text-lg text-gray-600 mb-8">
                Войдите в систему для доступа к функциям приложения.
            </p>
            <div class="space-x-4">
                <a
                        href="/login"
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg"
                >
                    Войти
                </a>
                <a
                        href="/register"
                        class="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 text-lg"
                >
                    Регистрация
                </a>
            </div>
        {/if}
    </div>
</div>