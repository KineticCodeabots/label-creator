import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// create path from dirname, ../lists
export const LISTS_PATH = path.join(__dirname, "../../lists");

export async function getLists() {
	return (await fs.readdir(LISTS_PATH))
		.filter((file) => file.endsWith(".json"))
		.map((file) => file.slice(0, -5));
}
export async function getList(listName) {
	const data = await fs.readFile(
		path.join(LISTS_PATH, `${listName}.json`),
		"utf-8"
	);
	const list = JSON.parse(data);
	return list;
}

export async function updateList(listName, list) {
	await fs.writeFile(
		path.join(LISTS_PATH, `${listName}.json`),
		JSON.stringify(list, null, 2)
	);
}
