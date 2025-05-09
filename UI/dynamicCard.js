const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { fontRegister } = require("./fonts/fontRegister");
const path = require("path");
const data = require("./banners/musicard"); 

async function dynamicCard({
  thumbnailURL,
  songTitle,
  songArtist,
  trackRequester,
  fontPath,
}) {
  const cardWidth = 800;
  const cardHeight = 250;

  const canvas = createCanvas(cardWidth, cardHeight);
  const ctx = canvas.getContext("2d");

  if (fontPath) {
    await fontRegister(fontPath, "CustomFont");
  }

  // 🎨 Select a random background image
  const randomBgPath =
    data.backgroundImages[Math.floor(Math.random() * data.backgroundImages.length)];
  const backgroundImage = await loadImage(randomBgPath);

  // ✅ Draw background image
  ctx.drawImage(backgroundImage, 0, 0);

  // 🔥 Add a blur layer on top of the background
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)"; // Semi-transparent black for blur effect
  ctx.filter = "blur(10px)"; // Apply blur effect
  ctx.fillRect(0, 0, cardWidth, cardHeight);
  ctx.filter = "none"; // Reset filter for other elements

  // 🖼️ Load the thumbnail image
  const thumbnailImage = await loadImage(thumbnailURL);
  const padding = 20;
  const thumbnailSize = cardHeight - 2 * padding;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cardWidth - thumbnailSize - padding + 20, padding);
  ctx.arcTo(
    cardWidth - padding,
    padding,
    cardWidth - padding,
    padding + 20,
    20
  );
  ctx.arcTo(
    cardWidth - padding,
    cardHeight - padding,
    cardWidth - padding - 20,
    cardHeight - padding,
    20
  );
  ctx.arcTo(
    cardWidth - thumbnailSize - padding,
    cardHeight - padding,
    cardWidth - thumbnailSize - padding,
    cardHeight - padding - 20,
    20
  );
  ctx.arcTo(
    cardWidth - thumbnailSize - padding,
    padding,
    cardWidth - thumbnailSize - padding + 20,
    padding,
    20
  );
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(
    thumbnailImage,
    cardWidth - thumbnailSize - padding,
    padding,
    thumbnailSize,
    thumbnailSize
  );
  ctx.restore();

  // 📝 Text styles (placed above blur layer)
  ctx.fillStyle = "white";
  ctx.font = fontPath ? "bold 35px 'CustomFont'" : "bold 35px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const maxWidth = cardWidth - thumbnailSize - padding * 2;
  let truncatedTitle = songTitle;
  while (ctx.measureText(truncatedTitle).width > maxWidth) {
    truncatedTitle = truncatedTitle.slice(0, -1);
  }
  if (truncatedTitle.length < songTitle.length) {
    truncatedTitle = truncatedTitle.slice(0, -3) + "...";
  }

  ctx.fillText(truncatedTitle, padding + 10, padding + 20);
  ctx.fillStyle = "#A79D9D";
  ctx.font = fontPath ? "25px 'CustomFont'" : "25px Arial";
  ctx.fillText(songArtist, padding + 10, padding + 70);
  ctx.font = fontPath ? "20px 'CustomFont'" : "20px Arial";
  ctx.fillText(
    `Requested by: ${trackRequester}`,
    padding + 10,
    cardHeight - padding - 30
  );

  return canvas.toBuffer("image/png");
}

module.exports = { dynamicCard };
