<script lang="ts">
    import {onMount} from 'svelte';
    import {goto} from '$app/navigation';
    import {auth} from '$lib/stores/auth';

    onMount(() => {
        // Ждем загрузки состояния авторизации
        return auth.subscribe((authState) => {
            if (!authState.isLoading) {
                if (authState.isAuthenticated) {
                    goto('/dashboard');
                } else {
                    goto('/login');
                }
            }
        });
    });
</script>

<!-- Показываем загрузку пока определяемся с перенаправлением -->
<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
    <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Загрузка...</p>
    </div>
</div>