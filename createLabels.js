import * as fs from "fs/promises";
import * as ejs from "ejs";

const args = process.argv.slice(2);
const contentsList = JSON.parse(
	await fs.readFile(args[0] || "contentsList.json", "utf-8")
);

const labels = await ejs.renderFile("label.ejs", { contentsList: contentsList.list });

await fs.writeFile("labels.html", labels);