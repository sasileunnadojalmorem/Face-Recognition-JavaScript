const imageUpload = document.getElementById('videoFile')
const hiddenbutton = document.getElementById('hidden')
function hideButton() {
  hiddenbutton.style.display = 'none';
}

// 히든 버튼을 보이는 함수
function showButton() {
  hiddenbutton.style.display = 'block'; // 혹은 'inline' 등을 사용하여 적절한 display 값을 설정할 수 있습니다.
}



Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)
async function sendDataToServer(data) {
  try {
    const response = await fetch('/a', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to send data to server');
    }

    const responseData = await response.json();
    console.log('Response from server:', responseData);
  } catch (error) {
    console.error('Error sending data to server:', error);
  }
}
async function start() {
  hideButton()
  
  const container = document.createElement('div');
  container.style.position = 'relative';
  document.body.append(container);
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  let video;
  let canvas;
  document.body.append('Loaded');

  let faceDetectionData = []; // 얼굴 감지 정도를 저장할 배열
  let mouthOpennessData = []; // 입 열림 정도를 저장할 배열
  let timeElapsed = 0; // 경과한 시간을 추적할 변수
  let intervalId;
  // Change event listener for video file input
  let frameData = []; // 각 프레임의 데이터를 저장할 배열

  imageUpload.addEventListener('change', async () => {
    if (video) {
      video.pause(); // Pause video if it's already playing
      video.remove(); // Remove previous video element
    }
    
    if (canvas) canvas.remove(); // Remove previous canvas element

    // Create video element
    video = document.createElement('video');
    video.src = URL.createObjectURL(imageUpload.files[0]);
    video.controls = true;
    container.append(video);

    // Play video and start processing frames after video is loaded
    video.addEventListener('loadedmetadata', async () => {
      canvas = document.createElement('canvas');
      container.append(canvas);

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      let a=1;
      setInterval(async () => {
        // Capture current frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        // Detect faces in the current frame
        const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // Process each detected face
        resizedDetections.forEach(detection => {
          const match = faceMatcher.findBestMatch(detection.descriptor);
          const landmarks = detection.landmarks.getMouth();
          const mouthStatus = getMouthStatus(landmarks);
          const box = detection.detection.box;
          
          if (video.currentTime >= video.duration) {
            clearInterval(intervalId); // 비디오 끝나면 타이머 중지
            if(a == 1) {
              sendDataToServer(frameData);
              showButton();
              a=0;}
            
            return; // 함수 종료
          }
          else{
            const faceData = {
              label: match.label,
              detectionLevel: match.distance,
              mouthOpenness: mouthStatus,
              box: box,
              time: parseFloat(timeElapsed .toFixed(1)) // 소수점 1자리까지 반올림
            };
            console.log(faceData);
            frameData.push(faceData); // 배열에 데이터 추가
          // Store face detection data
          faceDetectionData.push({ time: timeElapsed, detectionLevel: match.distance });
          
          // Store mouth openness data
          mouthOpennessData.push({ time: timeElapsed, mouthOpenness: mouthStatus });
          
          // Draw bounding box around the face
          const drawBox = new faceapi.draw.DrawBox(box, { label: `${match.label} - Similarity: ${match.distance.toFixed(2)}` });
          drawBox.draw(canvas);
          }
          // Draw text with mouth movement status
          const text = new faceapi.draw.DrawTextField(
            [`${mouthStatus.toFixed(2)} - Mouth movement`],
            { x: box.x, y: box.y + box.height + 10 }
          );
          text.draw(canvas);
        });

        

        timeElapsed += 0.1; // Increase time elapsed by 0.1 seconds
        
        
        
      }, 100); // Adjust interval as needed
      
    });
    
    
    video.play(); // Start playing the video
    
    
  });
}



// somewhere in your code where you want to send the data


// Change event listener for video file input


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
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/sasileunnadojalmorem/Face-Recognition-JavaScript/master/public/labeled_images/${label}/${i}.jpg`)
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
