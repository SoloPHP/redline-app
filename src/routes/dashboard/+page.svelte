<script lang="ts">
    import { auth } from '$lib/stores/auth';
</script>

<svelte:head>
    <title>Dashboard - RedLine App</title>
</svelte:head>

<div class="max-w-7xl mx-auto py-6 px-4">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
            Добро пожаловать, {$auth.user?.name}!
        </h1>
        <p class="mt-2 text-gray-600">
            Это ваша панель управления
        </p>
    </div>

    <!-- Карточки -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Email</p>
                    <p class="text-lg font-semibold text-gray-900">{$auth.user?.email}</p>
                </div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">ID пользователя</p>
                    <p class="text-lg font-semibold text-gray-900">{$auth.user?.id}</p>
                </div>
            </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
            <div class="flex items-center">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-gray-500">Последний вход</p>
                    <p class="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString('ru-RU')}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Быстрые действия -->
    <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
                    href="/profile"
                    class="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
                <svg class="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-medium text-gray-900">Профиль</span>
            </a>

            <a
                    href="/settings"
                    class="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
                <svg class="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-sm font-medium text-gray-900">Настройки</span>
            </a>

            <a
                    href="/posts"
                    class="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
                <svg class="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm font-medium text-gray-900">Посты</span>
            </a>

            <a
                    href="/upload"
                    class="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
                <svg class="h-6 w-6 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span class="text-sm font-medium text-gray-900">Загрузка</span>
            </a>
        </div>
    </div>
</div>