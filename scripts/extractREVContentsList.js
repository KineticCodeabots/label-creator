import * as pdf from "pdfjs-dist";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import { createCanvas } from "canvas";
import crypto from "crypto";

function enrichOperatorList(operatorList) {
	const enrichedOperatorList = [];
	for (let i = 0; i < operatorList.fnArray.length; i++) {
		enrichedOperatorList[i] = {
			op: Object.keys(pdf.OPS).find(
				(key) => pdf.OPS[key] === operatorList.fnArray[i]
			),
			args: operatorList.argsArray[i],
		};
	}
	return enrichedOperatorList;
}

function chunkArray(array, size) {
	const result = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
}

const packsRegex = / - \d+ Pack$/;

const contentsList = [];

await fs.mkdir("images").catch(() => {});

const document = await pdf.getDocument({
	url: "visual-bom.pdf",
}).promise;

for (let pageNum = 1; pageNum <= document.numPages; pageNum++) {
	const page = await document.getPage(pageNum);
	// const annotations = await page.getAnnotations();
	// const structTree = await page.getStructTree();
	const textContent = await page.getTextContent({
		includeMarkedContent: true,
	});
	const operatorList = await page.getOperatorList();
	// const enrichedOperatorList = enrichOperatorList(operatorList);
	const cleanedTextContent = textContent.items.filter(
		(text) => text.fontName === "g_d0_f3"
	);
	cleanedTextContent.shift();
	const chunkedTextContent = chunkArray(cleanedTextContent, 5);
	const imgGen = imageGenerator(page.objs, operatorList);
	for (const textContentChunk of chunkedTextContent) {
		const partNumber = textContentChunk[0].str;
		const description = textContentChunk[2].str.replace(packsRegex, "");
		const hash = generateHash(partNumber + description);
		contentsList.push({
			partNumber,
			description,
			hash,
		});
		if (partNumber !== "REV-41-1839") {
			const imgGenResult = await imgGen.next();
			if (imgGenResult.done) {
				console.log("Failed to find image for", partNumber);
				continue;
			}
			const image = imgGenResult.value;
			savePDFImage(`images/${hash}.png`, image);
		}
	}
}

fs.writeFile("contentsList.json", JSON.stringify(contentsList, null, "  "));

async function* imageGenerator(objs, operatorList) {
	for (let i = 0; i < operatorList.fnArray.length; i++) {
		const operatorCode = operatorList.fnArray[i];
		if (operatorCode === pdf.OPS.paintImageXObject) {
			const imgId = operatorList.argsArray[i][0];
			const image = await new Promise((resolve) =>
				objs.get(imgId, resolve)
			);
			yield image;
		}
	}
}

function savePDFImage(filepath, image) {
	// Assuming the image is a `Canvas`-compatible format (e.g., PNG)
	const { width, height, data } = image; // Assuming imageObj contains width, height, and data

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	// Create ImageData object from the raw data (PDF.js image)
	const imageData = ctx.createImageData(width, height);
	imageData.data.set(addAlphaChannelToUnit8ClampedArray(data, width, height));

	ctx.putImageData(imageData, 0, 0);

	// Write canvas image to file
	const out = fsSync.createWriteStream(filepath);
	const stream = canvas.createPNGStream();
	stream.pipe(out);

	return new Promise((res) => {
		out.on("finish", res);
	});
}

function addAlphaChannelToUnit8ClampedArray(
	unit8Array,
	imageWidth,
	imageHeight
) {
	const expectedLength = imageWidth * imageHeight * 3;
	if (unit8Array.length !== expectedLength) return unit8Array;
	const newImageData = new Uint8ClampedArray(imageWidth * imageHeight * 4);

	for (let j = 0, k = 0, jj = imageWidth * imageHeight * 4; j < jj; ) {
		newImageData[j++] = unit8Array[k++];
		newImageData[j++] = unit8Array[k++];
		newImageData[j++] = unit8Array[k++];
		newImageData[j++] = 255;
	}

	return newImageData;
}

function generateHash(inputString) {
	return crypto
		.createHash("sha256") // Choose the hashing algorithm (e.g., 'sha256', 'md5', etc.)
		.update(inputString)
		.digest("hex"); // 'hex' for readable hash, or 'base64' for base64 encoding
}
