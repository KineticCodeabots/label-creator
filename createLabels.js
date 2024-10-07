import * as fs from "fs/promises";
import * as ejs from "ejs";
import path from "path";

const args = process.argv.slice(2);
const contentsListFilename = args[0] || "contentsList.json";
const imagesDir = args[1] || "croppedImages";
const contentsList = JSON.parse(
	await fs.readFile(contentsListFilename, "utf-8")
);

const labelsHTML = await ejs.renderFile("label.ejs", {
	listName: path.basename(
		contentsListFilename,
		path.extname(contentsListFilename)
	),
	contentsList: contentsList.list,
	images: imagesDir,
});

// save labels pased on filename but with extension changed to .html (not just for .json)
await fs.writeFile(
	path.basename(contentsListFilename, path.extname(contentsListFilename)) +
		".html",
	labelsHTML
);
