import fs from "fs/promises";
import { createWriteStream } from "fs";
import { createCanvas } from "canvas";
import * as pdfjsLib from "pdfjs-dist";
// Function to save extracted image to disk
async function savePDFImage(filepath, image) {
	const { width, height, data } = image;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	// Create ImageData object from the raw data (PDF.js image)
	const imageData = ctx.createImageData(width, height);
	imageData.data.set(addAlphaChannelToUnit8ClampedArray(data, width, height));

	ctx.putImageData(imageData, 0, 0);

	// Write canvas image to file
	const out = createWriteStream(filepath);
	const stream = canvas.createPNGStream();
	stream.pipe(out);

	return new Promise((res) => {
		out.on("finish", res);
	});
}

// Adds an alpha channel to an image array
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

// Main function to extract images from the PDF
export async function extractImagesFromPDF(pdfPath) {
	const doc = await pdfjsLib.getDocument(pdfPath).promise;

	for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
		const page = await doc.getPage(pageNum);
		const operatorList = await page.getOperatorList();
		const images = [];

		for (let i = 0; i < operatorList.fnArray.length; i++) {
			const fnId = operatorList.fnArray[i];
			const args = operatorList.argsArray[i];

			// `pdf.js` uses `paintImageXObject` and `paintJpegXObject` operators for images
			if (
				fnId === pdfjsLib.OPS.paintImageXObject ||
				fnId === pdfjsLib.OPS.paintJpegXObject
			) {
				try {
					const image = await new Promise((resolve) =>
						page.objs.get(args[0], resolve)
					);
					images.push(image);
				} catch (err) {
					console.error("Error getting image:", err);
					continue;
				}
			}
		}

		// Save extracted images
		for (let i = 0; i < images.length; i++) {
			const image = images[i];
			const imagePath = `output/page_${pageNum}_image_${i + 1}.png`;
			await savePDFImage(imagePath, image);
			console.log(`Saved image: ${imagePath}`);
		}
	}
}

// Example usage: extracting images from a PDF
const pdfPath = "ftcset.pdf";
extractImagesFromPDF(pdfPath)
	.then(() => {
		console.log("Image extraction complete!");
	})
	.catch((err) => {
		console.error("Error extracting images:", err);
	});
