import { Jimp } from "jimp";
import fs from "fs/promises";

(async () => {
	await fs.mkdir("croppedImages").catch(() => {});
	const images = await fs.readdir("images");
	for (const imageFilename of images) {
		try {
			await cropImage(
				`images/${imageFilename}`,
				`croppedImages/${imageFilename}`
			);
		} catch (err) {
			console.error(`Error processing ${imageFilename}: ${err.message}`);
			await fs.copyFile(
				`images/${imageFilename}`,
				`croppedImages/${imageFilename}`
			);
		}
	}
})();

// Define the color to consider as "white" (adjust tolerance if needed)
const WHITE_COLOR = 0xffffffff; // 0xFFFFFFFF for fully white, ARGB format

// Helper function to check if a pixel is white
function isWhite(pixelColor) {
	const tolerance = 0x0f0f0f0f; // Adjust tolerance as needed
	const diff = Math.abs(pixelColor - WHITE_COLOR);
	return diff <= tolerance;
}

async function cropImage(imagePath, outputPath) {
	const image = await Jimp.read(imagePath);

	const width = image.bitmap.width;
	const height = image.bitmap.height;

	let top = 0,
		bottom = height - 1,
		left = 0,
		right = width - 1;

	// Find the top boundary (first row that contains non-white pixels)
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			if (!isWhite(image.getPixelColor(x, y))) {
				top = y;
				break;
			}
		}
		if (top !== 0) break;
	}

	// Find the bottom boundary
	for (let y = height - 1; y >= 0; y--) {
		for (let x = 0; x < width; x++) {
			if (!isWhite(image.getPixelColor(x, y))) {
				bottom = y;
				break;
			}
		}
		if (bottom !== height - 1) break;
	}

	// Find the left boundary
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			if (!isWhite(image.getPixelColor(x, y))) {
				left = x;
				break;
			}
		}
		if (left !== 0) break;
	}

	// Find the right boundary
	for (let x = width - 1; x >= 0; x--) {
		for (let y = 0; y < height; y++) {
			if (!isWhite(image.getPixelColor(x, y))) {
				right = x;
				break;
			}
		}
		if (right !== width - 1) break;
	}

	// Calculate new dimensions
	const newWidth = right - left + 1;
	const newHeight = bottom - top + 1;

	// Crop the image
	const croppedImage = image.crop({
		x: left,
		y: top,
		w: newWidth,
		h: newHeight,
	});
	await croppedImage.write(outputPath);
}
