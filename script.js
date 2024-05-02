const imageUpload = document.getElementById('imageUpload')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  const container = document.createElement('div')
  container.style.position = 'relative'
  document.body.append(container)
  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  let image
  let canvas
  document.body.append('Loaded')
  imageUpload.addEventListener('change', async () => {
    if (image) image.remove()
    if (canvas) canvas.remove()
    image = await faceapi.bufferToImage(imageUpload.files[0])
    container.append(image)
    canvas = faceapi.createCanvasFromMedia(image)
    container.append(canvas)
    const displaySize = { width: image.width, height: image.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => {
      const match = faceMatcher.findBestMatch(d.descriptor)
      const landmarks = d.landmarks.getMouth()
      const mouthStatus = getMouthStatus(landmarks)
      return { label: match.toString(), similarity: match.distance, mouthStatus: mouthStatus }
    })
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: `${result.label} - Similarity: ${result.similarity.toFixed(2)}` })
      drawBox.draw(canvas)
      const text = new faceapi.draw.DrawTextField(
        [
          `${result.mouthStatus.toFixed(2)} - Mouth movement`
        ],
        { x: box.x, y: box.y + box.height + 10 }
      )
      text.draw(canvas)
    })
  })
}

function getMouthStatus(landmarks) {
  // Calculate mouth openness
  const mouthWidth = landmarks[6].x - landmarks[0].x
  const mouthHeight = (landmarks[14].y + landmarks[15].y) / 2 - (landmarks[2].y + landmarks[3].y) / 2
  const mouthOpenness = mouthHeight / mouthWidth
  return mouthOpenness
}

function loadLabeledImages() {
  const labels = ['kim jae hyung', 'kin kyeng o', 'shin jaemin', 'jun jaemin']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/sasileunnadojalmorem/Face-Recognition-JavaScript/master/labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
