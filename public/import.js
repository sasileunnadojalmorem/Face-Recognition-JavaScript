// script.js

// 웹 소켓 연결 생성
const socket = new WebSocket('ws://localhost:3000');

// 서버로부터 메시지를 수신할 때 실행될 콜백 함수
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  const transcription = data.transcription;
  
  // 서버로부터 받은 텍스트를 화면에 표시
  console.log('Transcription:', transcription);
  
};

document.getElementById('voiceUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('voiceFile', file);
  
    fetch('/uploadVoice', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log('Server response:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });
  


    // 음성 파일 업로드 이벤트 핸들러
  