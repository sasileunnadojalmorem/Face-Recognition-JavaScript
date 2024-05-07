// 서버의 주소와 포트 번호 설정
const serverAddress = 'ws://main.projectgraphic.net:3000/ws';

// 웹 소켓 연결 생성
const socket = new WebSocket(serverAddress);

// 연결이 열렸을 때 실행되는 이벤트 핸들러
socket.onopen = function() {
  console.log('웹 소켓 연결이 열렸습니다.');
  
  // 서버로 메시지 전송
  socket.send('안녕하세요, 서버!');
};

// 메시지를 수신했을 때 실행되는 이벤트 핸들러
socket.onmessage = function(event) {
  console.log('서버로부터 메시지를 수신했습니다:', event.data);
};

// 연결이 닫혔을 때 실행되는 이벤트 핸들러
socket.onclose = function(event) {
  if (event.wasClean) {
    console.log('웹 소켓 연결이 정상적으로 닫혔습니다.');
  } else {
    console.error('웹 소켓 연결이 끊겼습니다.'); // 예기치 않은 종료
  }
};

// 에러가 발생했을 때 실행되는 이벤트 핸들러
socket.onerror = function(error) {
  console.error('웹 소켓 오류:', error);
};
  
