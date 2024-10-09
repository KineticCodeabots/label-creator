<script>
	import { updateList, uploadImage } from "./api";
	import PartLabel from "./PartLabel.svelte";

	export let listData;
	export let listName;
	$: console.log("List changed", listData.list);

	let saving = false;
	async function save() {
		saving = true;
		try {
			for (const part of listData.list) {
				if (part.file) {
					const filename = await uploadImage(part.file);
					part.image = filename;
				}
			}
			updateList(listName, {
				...listData,
				list: listData.list.map((p) => ({
					name: p.name,
					partNumber: p.partNumber,
					image: p.image,
				})),
			});
		} catch (err) {
			console.error(err);
		} finally {
			saving = false;
		}
	}

	function add() {
		listData.list.push({ name: "", partNumber: "", image: "" });
		listData = listData;
	}

	let removing = false;
	function startRemoving() {
		removing = !removing;
	}
	function labelClicked(part) {
		if (removing) {
			listData.list = listData.list.filter((p) => p !== part);
			listData = listData;
			removing = false;
		}
	}
</script>

<button on:click={save} disabled={saving}>Save</button>
<button on:click={add}>Add</button>
<button on:click={startRemoving}>Remove</button>

<div class="part-list">
	{#each listData.list as part}
		<PartLabel bind:part {removing} on:click={() => labelClicked(part)}
		></PartLabel>
	{/each}
</div>

<style>
	.part-list {
		display: flex;
		flex-wrap: wrap;
	}
</style>
