<script>
	import ListSelector from "./lib/ListSelector.svelte";
	import PartList from "./lib/PartList.svelte";
	import { fetchList, fetchLists } from "./lib/api";

	const listsPromise = fetchLists();
	let selectedListName;
	$: selectedListPromise = selectedListName
		? fetchList(selectedListName)
		: Promise.resolve();
</script>

<main>
	{#await listsPromise}
		<p>Loading...</p>
	{:then lists}
		{#if lists.length === 0}
			<p>No lists found</p>
		{:else}
			<ListSelector {lists} bind:selectedList={selectedListName}
			></ListSelector>
		{/if}
	{:catch error}
		<p>{error.message}</p>
	{/await}
	{#if selectedListName}
		{#await selectedListPromise}
			<p>Loading...</p>
		{:then selectedList}
			<PartList listData={selectedList} listName={selectedListName}
			></PartList>
		{:catch error}
			<p>{error.message}</p>
		{/await}
	{/if}
</main>

<style>
</style>
