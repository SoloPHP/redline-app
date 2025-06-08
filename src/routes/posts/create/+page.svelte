<script lang="ts">
    import { API_URL, fetchConfig } from '$lib/config';
    import { goto } from '$app/navigation';

    let title = '';
    let content = '';
    let loading = false;
    let error = '';

	async function createPost(event: SubmitEvent) {
		event.preventDefault();

        if (!title.trim() || !content.trim()) {
            error = 'Заполните все поля';
            return;
        }

        loading = true;
        error = '';

        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                ...fetchConfig,
                body: JSON.stringify({ title, content })
            });

            if (response.ok) {
                goto('/posts');
            } else {
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    error = errorJson.message || 'Ошибка создания поста';
                } catch {
                    error = errorText || 'Ошибка создания поста';
                }
            }
        } catch (err) {
            error = 'Ошибка сети';
        } finally {
            loading = false;
        }
    }
</script>

<svelte:head>
    <title>Создать пост - RedLine App</title>
</svelte:head>

<div class="max-w-2xl mx-auto py-6 px-4">
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Создать пост</h1>

    {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
        </div>
    {/if}

	<form onsubmit={createPost} class="space-y-6">
        <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Заголовок
            </label>
            <input
                    id="title"
                    type="text"
                    bind:value={title}
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите заголовок поста"
            />
        </div>

        <div>
            <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
                Содержание
            </label>
            <textarea
                    id="content"
                    bind:value={content}
                    required
                    rows="10"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите содержание поста"
            ></textarea>
        </div>

        <div class="flex space-x-4">
            <button
                    type="submit"
                    disabled={loading}
                    class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Создание...' : 'Создать пост'}
            </button>

            <a
                    href="/posts"
                    class="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
            >
                Отмена
            </a>
        </div>
    </form>
</div>