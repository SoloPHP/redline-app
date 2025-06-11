<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth';

    let posts = $state([]);
    let loading = $state(true);
    let error = $state('');

    onMount(async () => {
        await loadPosts();
    });

    async function loadPosts() {
        loading = true;
        error = '';

        try {
            // Используем новый API с автоматическим refresh токенов
            posts = await auth.apiCall('/posts');
        } catch (err: any) {
            error = err.message || 'Ошибка загрузки постов';
        } finally {
            loading = false;
        }
    }

    async function deletePost(id: string) {
        if (!confirm('Удалить пост?')) return;

        try {
            await auth.apiCall(`/posts/${id}`, { method: 'DELETE' });
            posts = posts.filter(post => post.id !== id);
        } catch (error: any) {
            alert(error.message || 'Ошибка удаления');
        }
    }
</script>

<svelte:head>
    <title>Посты - RedLine App</title>
</svelte:head>

<div class="max-w-7xl mx-auto py-6 px-4">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Посты</h1>
        <a
                href="/posts/create"
                class="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
        >
            Создать пост
        </a>
    </div>

    {#if error}
        <div class="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
            <button onclick={loadPosts} class="ml-2 underline">Попробовать снова</button>
        </div>
    {/if}

    {#if loading}
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p class="text-gray-600 dark:text-gray-400">Загрузка постов...</p>
        </div>
    {:else if posts.length === 0}
        <div class="text-center py-8">
            <p class="text-gray-600 dark:text-gray-400 mb-4">Постов пока нет</p>
            <a
                    href="/posts/create"
                    class="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
                Создать первый пост
            </a>
        </div>
    {:else}
        <div class="space-y-4">
            {#each posts as post (post.id)}
                <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm transition-colors">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {post.title}
                            </h2>
                            {#if post.content}
                                <p class="text-gray-600 dark:text-gray-400 line-clamp-3">{post.content}</p>
                            {/if}
                            <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                                {#if post.author}
                                    <span>Автор: {post.author.name}</span> •
                                {/if}
                                <span>{new Date(post.createdAt || Date.now()).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                        <div class="ml-4 flex space-x-2">
                            <a
                                    href="/posts/{post.id}/edit"
                                    class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
                            >
                                Редактировать
                            </a>
                            <button
                                    onclick={() => deletePost(post.id)}
                                    class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm transition-colors"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>