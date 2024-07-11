import { ready } from "./ready";

/**
 * Reveals an image once it's loaded.
 * @param {HTMLImageElement} img The image to reveal
 */
async function imgReady(img: HTMLImageElement): Promise<void> {
  await new Promise((resolve, reject) => {
    if (img.complete || img.naturalWidth > 0) {
      resolve(null);
      return;
    }
    img.onload = (): void => resolve(null);
    img.onerror = (err): void => reject(err);
  });
  console.log("Image loaded");
  img.style.visibility = "visible";
}

//bind events
ready(() => {
  const imgElements = document.querySelectorAll("img");
  imgElements.forEach((img) => {
    imgReady(img as HTMLImageElement);
  });
});
