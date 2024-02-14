const resultCanvas = document.getElementById('result')
const fileInput = document.getElementById('file-input')

const waveFrequencySlider = document.getElementById('waveFrequencySlider')
const waveFrequencyValue = document.getElementById('waveFrequencyValue')
const lineWidthSlider = document.getElementById('lineWidthSlider')
const lineWidthValue = document.getElementById('lineWidthValue')

const rowsDensitySlider = document.getElementById('rowsDensitySlider')
const rowsDensityValue = document.getElementById('rowsDensityValue')

const lineColorPicker = document.getElementById('lineColorPicker')
const colorPickerValue = document.getElementById('colorPickerValue')

const settingsPanel = document.getElementById('settingsPanel')


const HEIGHT = 700;
const BG_COLOR = '#ffffff';

let resultCtx;
let state;


let _stateInitConfig = {
  uploadedImage: undefined,
  waveFrequency: 4,
  lineWidth: 2,
  rowsDensity: 5,
  lineColor: '#000000',
  points: [],
  imageWidth: 0,
  imageHeight: 0
}


let stateChange = {
  set(target, property, value){
    target[property] = value;
    if (property === "uploadedImage" && target[property]){

    }
    if (property === "waveFrequency"){
      drawImage()
    }
    if (property === "lineWidth"){
      drawImage()
    }
    if (property === "rowsDensity"){
      drawImage()
    }
    if (property === "lineColor"){
      drawImage()
    }
  }
}

const initNewState = () => {

  state = new Proxy({..._stateInitConfig}, stateChange);
  
  waveFrequencySlider.value = state.waveFrequency;
  waveFrequencyValue.innerText = state.waveFrequency;
  waveFrequencySlider.addEventListener("input", (event) => {
    state.waveFrequency = parseInt(event.target.value, 10);
    waveFrequencyValue.textContent = state.waveFrequency;
  });
  
  lineWidthSlider.value = state.lineWidth;
  lineWidthValue.innerText = state.lineWidth;
  lineWidthSlider.addEventListener("input", (event) => {
    state.lineWidth = parseInt(event.target.value, 10);
    lineWidthValue.textContent = state.lineWidth;
  });
  
  rowsDensitySlider.value = state.rowsDensity;
  rowsDensityValue.textContent = state.rowsDensity;
  rowsDensitySlider.addEventListener("input", (event) => {
    state.rowsDensity = parseInt(event.target.value, 10);
    rowsDensityValue.textContent = state.rowsDensity;
  });

  lineColorPicker.value = state.lineColor;
  colorPickerValue.innerHTML = state.lineColor;
  lineColorPicker.addEventListener("input", (event) => {
    state.lineColor = event.target.value;
    colorPickerValue.innerHTML = state.lineColor;
  }, false);
  lineColorPicker.addEventListener("change", (event) => {
    state.lineColor = event.target.value;
    colorPickerValue.textContent = state.lineColor;
  }, false);
  lineColorPicker.select();
}


const getImageWidthAndHeight = (img) => {
  return [Math.floor(img.width * HEIGHT / img.height), HEIGHT];
}


/**
 * The function `getPointsArray` takes an uploaded image, converts it to grayscale, and returns an
 * array of pixel values.
 * @returns The function `getPointsArray` is returning the `pixels` array.
 */
const getPointsArray = () => {

  resultCtx.drawImage(state.uploadedImage, 0, 0, state.imageWidth, state.imageHeight)
  const {data: pixels} = resultCtx.getImageData(0, 0, state.imageWidth, state.imageHeight)

  /* Calc grayscale color of each pixel (RGBA, Uint8ClampedArray) */
  for (let i = 0; i < pixels.length; i += 4) {
    const grayscale = pixels[i + 3] === 0 ? 255 : pixels[i] * .3 + pixels[i + 1] * .59 + pixels[i + 2] * .11
    pixels[i] = grayscale
    pixels[i + 1] = grayscale
    pixels[i + 2] = grayscale
    pixels[i + 3] = 255
  }
  return pixels
}

/**
 * The `drawImage` function draws an image on a canvas using an array of points and various parameters.
 */
const drawImage = () => {
  
  if (state.points.length === 0) {
    state.points = getPointsArray();
  }

  let [imageWidth, imageHeight] = [state.imageWidth, state.imageHeight];

  resultCtx.fillStyle = BG_COLOR;
  resultCtx.fillRect(0, 0, imageWidth, imageHeight)

  for (let y = 0; y < 50; ++y) {
    resultCtx.beginPath()
    resultCtx.lineWidth = state.lineWidth
    resultCtx.lineJoin = 'round'

    let l = 0;

    for (let x = 0; x < imageWidth; ++x) {

      // calc curr pixel in a one-line RGBA-pixels image array 
      const c = state.points[((y * imageHeight / 50 + 6) * imageWidth + x)*4]

      l += ( (255 - c + state.waveFrequency) / 255 )

      const m = (255 - c) / 255

      // drow point to x,y
      const pointY = (y + 0.5) * imageHeight / 50 + Math.sin(l * Math.PI / 2) * state.rowsDensity * (1-(m-1)*(m-1))

      resultCtx.strokeStyle = state.lineColor;
      resultCtx.lineTo(x, pointY)
    }
    resultCtx.stroke()
  }
}


/**
 * get file from html input
 */

const readAsDataUrl = (file) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = (e) => resolve(e.target.result)
  reader.readAsDataURL(file)
})

const loadImage = (src) => new Promise((resolve) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.src = src
})

fileInput.addEventListener('input', async (e) => {
  
  if (fileInput.files && fileInput.files[0]) {

    initNewState();

    const dataUrl = await readAsDataUrl(fileInput.files[0])
    state.uploadedImage = await loadImage(dataUrl)
    
    state.imageWidth = getImageWidthAndHeight(state.uploadedImage)[0];
    state.imageHeight = getImageWidthAndHeight(state.uploadedImage)[1];

    resultCanvas.width = state.imageWidth
    resultCanvas.height = state.imageHeight

    resultCtx = resultCanvas.getContext('2d')

    drawImage();

    settingsPanel.style.display = "inline-table"
    
  } else {
    console.error("Invalid file or file format")
  }
})
