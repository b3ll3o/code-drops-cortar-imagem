
const photoFile = document.getElementById('photo-file');
const photoPreview = document.getElementById('photo-preview');
const selection = document.getElementById('selection-tool');
const cropButton = document.getElementById('crop-image');
const downloadButton = document.getElementById('download');

let image;
let photoName;

document.getElementById('select-image')
  .onclick = () => {
    photoFile.click();
  }; 

window.addEventListener('DOMContentLoaded', () => {
  photoFile.onchange = () => {

    const file = photoFile.files.item(0);
    photoName = file.name;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = e => {
      image = new Image();
      image.src = e.target.result;
      image.onload = onLoadImage
    }
  }
});

let startX, startY, relativeStartX, relativeStartY, endX, endY, relativeEndX, relativeEndY;
let startSelection = false;

const events = {
  mousedown(){
    const { clientX, clientY, offsetX, offsetY } = event;

    startX = clientX;
    startY = clientY;
    relativeStartX = offsetX;
    relativeStartY = offsetY;

    startSelection = true;
  }, 
  mouseover(){
    this.style.cursor = 'crosshair';
  }, 
  mousemove(){
    const { clientX, clientY } = event;

    endX = clientX;
    endY = clientY;

    if(startSelection) {
      selection.style.display = 'initial';
      selection.style.top = `${startY}px`;
      selection.style.left = `${startX}px`;

      selection.style.width = `${endX - startX}px`;
      selection.style.height = `${endY - startY}px`;
    }
  }, 
  mouseup(){
    startSelection = false;

    const { layerX, layerY } = event;

    relativeEndX = layerX;
    relativeEndY = layerY;

    cropButton.style.display = 'initial';
  }
}

Object.keys(events)
  .forEach(eventName => {
    photoPreview.addEventListener(eventName, events[eventName]);
  });

let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

const onLoadImage = () => {
  const { width, height } = image;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  ctx.drawImage(image, 0, 0);

  photoPreview.src = canvas.toDataURL();
}

cropButton.onclick = () => {
  const { width: imageWidth, height: imageHeight } = image;
  const { width: photoPreviewWidth, height: photoPreviewHeight } = photoPreview;

  const [ widthFactory, heightFactory ] = [
    +(imageWidth / photoPreviewWidth), 
    +(imageHeight / photoPreviewHeight)
  ];
  
  const [ selectionWidth, selectionHeight ] = [
    +selection.style.width.replace('px', ''), 
    +selection.style.height.replace('px', '')
  ];

  const [ croppedWidth, croppedHeight ] = [
    +(selectionWidth * widthFactory), 
    +(selectionHeight * heightFactory)
  ];

  const [ actualX, actualY ] = [
    +(relativeStartX * widthFactory), 
    +(relativeStartY * heightFactory)
  ];

  const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight);

  ctx.clearRect(0, 0, ctx.width, ctx.height);

  image.width = canvas.width = croppedWidth;
  image.height = canvas.height = croppedHeight;

  ctx.putImageData(croppedImage, 0, 0);

  selection.style.display = 'none';

  photoPreview.src = canvas.toDataURL();

  downloadButton.style.display = 'initial';
}

downloadButton.onclick = () => {
  const a = document.createElement('a');

  a.download = photoName + '-cropped.png';
  a.href = canvas.toDataURL();
  a.click();
}

