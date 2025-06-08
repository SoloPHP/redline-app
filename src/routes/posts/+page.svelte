<script lang="ts">
    import { onMount } from 'svelte';
    import { API_URL, fetchConfig } from '$lib/config';

    let posts = [];
    let loading = true;
    let error = '';

    onMount(async () => {
        await loadPosts();
    });

    async function loadPosts() {
        loading = true;
        error = '';

        try {
            const response = await fetch(`${API_URL}/posts`, fetchConfig);

            if (response.ok) {
                posts = await response.json();
            } else {
                error = 'Ошибка загрузки постов';
            }
        } catch (err) {
            error = 'Ошибка сети';
        } finally {
            loading = false;
        }
    }

    async function deletePost(id) {
        if (!confirm('Удалить пост?')) return;

        try {
            const response = await fetch(`${API_URL}/posts/${id}`, {
                method: 'DELETE',
                ...fetchConfig
            });

            if (response.ok) {
                posts = posts.filter(post => post.id !== id);
            } else {
                alert('Ошибка удаления');
            }
        } catch (error) {
            alert('Ошибка сети');
        }
    }
</script>

<svelte:head>
    <title>Посты - RedLine App</title>
</svelte:head>

<div class="max-w-7xl mx-auto py-6 px-4">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Посты</h1>
        <a
                href="/posts/create"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            Создать пост
        </a>
    </div>

    {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onclick={loadPosts} class="ml-2 underline">Попробовать снова</button>
        </div>
    {/if}

    {#if loading}
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Загрузка постов...</p>
        </div>
    {:else if posts.length === 0}
        <div class="text-center py-8">
            <p class="text-gray-600 mb-4">Постов пока нет</p>
            <a
                    href="/posts/create"
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Создать первый пост
            </a>
        </div>
    {:else}
        <div class="space-y-4">
            {#each posts as post (post.id)}
                <div class="bg-white border rounded-lg p-6 shadow-sm">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h2 class="text-xl font-semibold text-gray-900 mb-2">
                                {post.title}
                            </h2>
                            {#if post.content}
                                <p class="text-gray-600 line-clamp-3">{post.content}</p>
                            {/if}
                            <div class="mt-4 text-sm text-gray-500">
                                {#if post.author}
                                    <span>Автор: {post.author.name}</span> •
                                {/if}
                                <span>{new Date(post.createdAt || Date.now()).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                        <div class="ml-4 flex space-x-2">
                            <a
                                    href="/posts/{post.id}/edit"
                                    class="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                Редактировать
                            </a>
                            <button
                                    onclick={() => deletePost(post.id)}
                                    class="text-red-600 hover:text-red-800 text-sm"
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