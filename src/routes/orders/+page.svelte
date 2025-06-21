<script>
	import { Button, Badge, Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Alert } from 'flowbite-svelte';
	import {
		EyeOutline,
		ExclamationCircleOutline,
		SearchOutline
	} from 'flowbite-svelte-icons';
	import Layout from '$lib/components/Layout.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { goto } from '$app/navigation';

	let { data } = $props();

	function formatCurrency(amount) {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB'
		}).format(amount);
	}

	function formatDate(dateString) {
		return new Intl.DateTimeFormat('ru-RU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(dateString));
	}

	function getStatusColor(status) {
		switch (status?.toLowerCase()) {
			case 'active':
			case 'в_работе':
			case 'processing': return 'blue';
			case 'completed':
			case 'завершен':
			case 'done': return 'green';
			case 'pending':
			case 'ожидание':
			case 'waiting': return 'yellow';
			case 'cancelled':
			case 'отменен':
			case 'canceled': return 'red';
			default: return 'gray';
		}
	}

	function getStatusText(status) {
		switch (status?.toLowerCase()) {
			case 'active':
			case 'в_работе':
			case 'processing': return 'В работе';
			case 'completed':
			case 'завершен':
			case 'done': return 'Завершен';
			case 'pending':
			case 'ожидание':
			case 'waiting': return 'В ожидании';
			case 'cancelled':
			case 'отменен':
			case 'canceled': return 'Отменен';
			default: return status || 'Неизвестно';
		}
	}

	function getStatColorClasses(color) {
		const colors = {
			blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
			green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
			yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
			purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
		};
		return colors[color] || colors.blue;
	}

	function viewOrder(orderId) {
		goto(`/orders/${orderId}`);
	}
</script>

<svelte:head>
	<title>Заказы - Redline</title>
</svelte:head>

<Layout user={data.user} title="Заказы">
	<div class="space-y-6">
		<!-- Показываем ошибку, если заказы не загрузились -->
		{#if !data.orders}
			<Alert color="red" class="border-0 shadow-sm">
				<ExclamationCircleOutline slot="icon" class="w-5 h-5" />
				<span class="font-medium">Ошибка загрузки!</span>
				Не удалось загрузить список заказов. Попробуйте обновить страницу.
			</Alert>
		{:else}
			<!-- Header -->
			<div class="mb-6">
				<h3 class="text-xl font-semibold text-gray-900 dark:text-white">
					Список заказов
					{#if data.pagination?.totalItems}
						<span class="text-sm font-normal text-gray-500 dark:text-gray-400">
							({data.pagination.totalItems} всего)
						</span>
					{/if}
				</h3>
			</div>

			<!-- Table without Card -->
			{#if data.orders.length === 0}
				<div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
					<div class="text-gray-400 mb-4">
						<SearchOutline class="w-12 h-12 mx-auto" />
					</div>
					<p class="text-lg font-medium text-gray-900 dark:text-white">Заказы не найдены</p>
					<p class="text-gray-500 dark:text-gray-400">
						Создайте первый заказ для начала работы
					</p>
				</div>
			{:else}
				<div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
					<Table class="w-full">
						<TableHead>
							<TableHeadCell class="!px-6 !py-3">Номер заказа</TableHeadCell>
							<TableHeadCell class="!px-6 !py-3">Клиент</TableHeadCell>
							<TableHeadCell class="!px-6 !py-3">Сумма</TableHeadCell>
							<TableHeadCell class="!px-6 !py-3">Статус</TableHeadCell>
							<TableHeadCell class="!px-6 !py-3">Дата</TableHeadCell>
							<TableHeadCell class="!px-6 !py-3">Действия</TableHeadCell>
						</TableHead>
						<TableBody>
							{#each data.orders as order (order.id)}
								<TableBodyRow class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
									<TableBodyCell class="!px-6 !py-4">
										<span class="font-semibold text-gray-900 dark:text-white">
											{order.number || order.order_number || `#${order.id}`}
										</span>
									</TableBodyCell>
									<TableBodyCell class="!px-6 !py-4">
										<div class="text-gray-900 dark:text-white">
											{order.customer || order.client_name || order.customer_name || 'Не указан'}
										</div>
									</TableBodyCell>
									<TableBodyCell class="!px-6 !py-4">
										<span class="font-semibold text-gray-900 dark:text-white">
											{formatCurrency(order.amount || order.total || 0)}
										</span>
									</TableBodyCell>
									<TableBodyCell class="!px-6 !py-4">
										<Badge color={getStatusColor(order.status)} class="font-medium">
											{getStatusText(order.status)}
										</Badge>
									</TableBodyCell>
									<TableBodyCell class="!px-6 !py-4">
										<span class="text-gray-500 dark:text-gray-400">
											{formatDate(order.created_at || order.date)}
										</span>
									</TableBodyCell>
									<TableBodyCell class="!px-6 !py-4">
										<Button
											color="alternative"
											size="xs"
											class="!px-3 !py-1.5"
											onclick={() => viewOrder(order.id)}
										>
											<EyeOutline class="w-3 h-3 mr-1" />
											Просмотр
										</Button>
									</TableBodyCell>
								</TableBodyRow>
							{/each}
						</TableBody>
					</Table>
				</div>

				<!-- Pagination -->
				<Pagination pagination={data.pagination} />
			{/if}
		{/if}
	</div>
</Layout>