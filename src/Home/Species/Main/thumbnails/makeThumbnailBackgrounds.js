/* eslint-disable */
const fs = require('fs');
const { execSync } = require('child_process');

function getThumbnails() {
  const files = fs.readdirSync('./');
  const byThumbnails = file => file.includes('.png') && !file.includes('_bg');

  return files.filter(byThumbnails);
}

const thumbnails = getThumbnails();
console.log(thumbnails);

const createBackground = thumbnail => {
  const newName = thumbnail.replace('.png', '_bg.png');
  console.log(
    `🍄 convert "${thumbnail}"  -channel RGBA  -blur 0x80 -resize 1000x1000  -gravity center -crop 500x500+0+0 +repage ${newName}`
  );
  execSync(
    `convert "${thumbnail}"  -channel RGBA  -blur 0x80 -resize 1000x1000  -gravity center -crop 500x500+0+0 +repage ${newName}`,
    { stdio: 'inherit' }
  );

  execSync(
    `convert ${newName}  ./makeThumbnailBackgroundsMask.png -composite  -resize 100 ${newName}`,
    { stdio: 'inherit' }
  );
};
thumbnails.forEach(createBackground);
