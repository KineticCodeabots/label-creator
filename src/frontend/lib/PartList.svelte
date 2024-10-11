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
	function labelClicked(event, part) {
		if (removing) {
			event.preventDefault();
			listData.list = listData.list.filter((p) => p !== part);
			listData = listData;
			removing = false;
		}
	}

	let autocrop = false;
</script>

<div class="controls print-hide">
	<button on:click={save} disabled={saving}>Save</button>
	<button class="add" on:click={add}>Add</button>
	<button class="remove" on:click={startRemoving}>Remove</button>
	<button on:click={() => window.print()}>Print</button>
	<div class="autocrop-control">
		<label for="autocrop">Auto Crop</label>
		<input type="checkbox" id="autocrop" bind:checked={autocrop} />
	</div>
</div>

<div class="part-list" data-listname={listName}>
	{#each listData.list as part}
		<PartLabel
			bind:part
			{autocrop}
			{removing}
			on:click={(event) => labelClicked(event, part)}
		></PartLabel>
	{/each}
</div>

<style>
	.part-list {
		display: flex;
		flex-wrap: wrap;
	}
	.controls {
		display: flex;
		gap: 10px;
		margin-top: 20px;
		margin-bottom: 20px;
	}

	button {
		padding: 10px 15px;
		border: none;
		background-color: #007bff;
		color: white;
		cursor: pointer;
		border-radius: 5px;
	}

	button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}

	.add {
		background-color: #28a745;
	}
	.remove {
		background-color: #dc3545;
	}
	.autocrop-control {
		display: flex;
		align-items: center; /* Ensures the label and checkbox are aligned */
		gap: 5px;
	}
</style>
