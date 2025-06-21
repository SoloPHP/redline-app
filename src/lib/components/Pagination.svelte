<script>
	import { goto } from '$app/navigation';

	let { pagination = null } = $props();

	function navigate(url, e) {
		e.preventDefault();
		goto(url);
	}
</script>

{#if pagination && pagination.totalPages > 1}
	<div class="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
		<!-- Info text -->
		<div class="text-sm text-gray-700 dark:text-gray-300">
			Показано <span class="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
			до <span class="font-medium">{Math.min(pagination.page * pagination.limit, pagination.totalItems)}</span>
			из <span class="font-medium">{pagination.totalItems}</span> результатов
		</div>

		<!-- Pagination controls -->
		<div class="flex items-center space-x-1">
			<!-- Previous button -->
			{#if pagination.hasPreviousPage}
				<a
					href={pagination.previousPageUrl}
					onclick={(e) => navigate(pagination.previousPageUrl, e)}
					data-sveltekit-preload-data="off"
					class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
				>
					&laquo;
				</a>
			{:else}
				<span class="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 rounded-l-lg cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500">
					&laquo;
				</span>
			{/if}

			<!-- Page links -->
			{#each pagination.links as link (link.page || link.url || link.isEllipsis)}
				{#if link.isEllipsis}
					<span class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
						...
					</span>
				{:else if link.isCurrent}
					<span class="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400">
						{link.page}
					</span>
				{:else}
					<a
						href={link.url}
						onclick={(e) => navigate(link.url, e)}
						data-sveltekit-preload-data="off"
						class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
					>
						{link.page}
					</a>
				{/if}
			{/each}

			<!-- Next button -->
			{#if pagination.hasNextPage}
				<a
					href={pagination.nextPageUrl}
					onclick={(e) => navigate(pagination.nextPageUrl, e)}
					data-sveltekit-preload-data="off"
					class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
				>
					&raquo;
				</a>
			{:else}
				<span class="px-3 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-300 rounded-r-lg cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500">
					&raquo;
				</span>
			{/if}
		</div>
	</div>

	<!-- Limit selector (if options available) -->
	{#if pagination.limitOptions && pagination.limitOptions.length > 1}
		<div class="flex justify-end mt-4">
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-700 dark:text-gray-300">Показывать:</span>
				<select
					class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none transition-colors"
					onchange={(e) => {
						const selectedOption = pagination.limitOptions.find(opt => opt.value === parseInt(e.target.value));
						if (selectedOption) {
							navigate(selectedOption.url, e);
						}
					}}
				>
					{#each pagination.limitOptions as option (option.value)}
						<option
							value={option.value}
							selected={option.isCurrent}
						>
							{option.value}
						</option>
					{/each}
				</select>
				<span class="text-sm text-gray-700 dark:text-gray-300">на странице</span>
			</div>
		</div>
	{/if}
{/if}