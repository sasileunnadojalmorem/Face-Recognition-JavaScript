const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');
const multer = require('multer');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Google Cloud Speech-to-Text 클라이언트 생성
const keyFile = 'C:\\Users\\ddd\\3D Objects\\key.json';
const client = new SpeechClient({ keyFilename: keyFile });

// multer 설정
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());
let videodata = [];
let voicedatacheck = 0;
let voicedata1 = [];
let videodatacheck = 0;
app.post('/a', (req, res) => {
  // 클라이언트로부터 받은 데이터를 req.body로 가져옵니다.
  const data = req.body;

  // 여기서 받은 데이터를 원하는 대로 처리합니다.
  // 예를 들어, 받은 데이터를 콘솔에 출력하거나 데이터베이스에 저장할 수 있습니다.
  console.log('http://localhost:3000/', data);

  // 클라이언트에게 응답을 보냅니다. (선택사항)
  res.send({ message: 'Data received successfully' });
 
  videodata = data;
  console.log(data);
  videodatacheck = 1;
});


// 파일 업로드를 처리하는 라우트
app.post('/uploadVideo', upload.single('videoFile'), async (req, res) => {
  const videoFilePath = req.file.path;
  const outputDirectory = path.join(__dirname, 'processed');
  const outputFilePath = path.join(outputDirectory, 'output.wav');

  try {
    // 생성할 디렉토리가 없는 경우 생성
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }

    // ffmpeg를 사용하여 비디오를 WAV 파일로 변환
    await new Promise((resolve, reject) => {
      ffmpeg(videoFilePath)
        .output(outputFilePath)
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioBitrate('16000')
        
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
        const voiceData = fs.readFileSync(outputFilePath);
        let test1 = recognizeSpeech(outputFilePath);
        

    res.json({ message: 'File converted successfully.' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred during file conversion.' });
  }
});

app.post('/uploadVoice', upload.single('voiceFile'), async (req, res) => {
  const voiceFilePath = req.file.path;

  // Google Cloud Speech-to-Text API에 전달하여 음성 인식 수행
  recognizeSpeech(voiceFilePath)
    .then(transcription => {
      res.json({ transcription });
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred during speech recognition.' });
    });
});

async function recognizeSpeech(voiceFilePath) {
  try {
    // 파일을 읽어서 버퍼로 전달
    const voiceData = fs.readFileSync(voiceFilePath);

    // 버퍼를 base64 인코딩하여 API에 전달
    const audio = { content: voiceData.toString('base64') };

    // Speech-to-Text API에 전달
    const [response] = await client.recognize({
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 44100,
        languageCode: 'ko-KR',
        enableWordTimeOffsets: true,
      },
      audio: audio,
    });
   

    if (!response.results || response.results.length === 0) {
      console.log("No results found.");
      return '';
    }

    const transcription = [];

    // 워드 정보 추출 및 배열에 저장
    response.results.forEach((result) => {
      result.alternatives.forEach((alternative) => {
        alternative.words.forEach((word) => {
          const wordInfo = {
            word: word.word,
            startTime: parseFloat(word.startTime.seconds + '.' + word.startTime.nanos),
            endTime: parseFloat(word.endTime.seconds + '.' + word.endTime.nanos)
          };
          transcription.push(wordInfo);
          
        });
      });
    });
    
    voicedata1 = transcription;
    voicedatacheck = 1;
    console.log(voicedata1);
    if (voicedatacheck === 1 && videodatacheck === 1) {
      
      const matchedLabels = findMatchingLabels(videodata, voicedata1);
      console.log(matchedLabels);
      
    }
    return transcription;

  } catch (err) {
    console.error('Error occurred:', err);
    throw err;
  }
}

// 웹 소켓 연결이 수립될 때 실행되는 이벤트 리스너
wss.on('connection', function connection(ws) {
  console.log('클라이언트가 연결되었습니다.');

  // 클라이언트로부터 메시지를 수신할 때 실행되는 이벤트 리스너
  ws.on('message', function incoming(message) {
    console.log('클라이언트로부터 메시지를 수신했습니다: %s', message);

    // 클라이언트로부터 받은 메시지를 모든 클라이언트에게 전송
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// 정적 파일을 제공하기 위한 Express 미들웨어 사용
app.use(express.static(path.join(__dirname, 'public'), {
  // MIME 타입 설정
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.js') {
      res.setHeader('Content-Type', 'application/javascript');
    }
  },
}));

// HTML 파일을 호스팅하기 위해 루트 경로로 요청이 들어오면 index.html을 전송
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버를 지정한 포트로 실행
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
function findMatchingLabels(data, transcription) {
  // 결과를 저장할 배열
  const resultArray = [];
  const dataset = [];
  // transcription의 각 항목에 대해 반복
  transcription.forEach(transcriptionItem => {
    // transcription 항목의 시작 시간(startTime)과 일치하는 데이터 찾기
    const matchingData = data.find(dataItem => dataItem.time === transcriptionItem.startTime);
    dataset.push(matchingData);
    // 해당하는 데이터가 있을 경우에만 처리
    if (matchingData) {
      // 데이터의 mouthOpenness가 가장 큰 라벨 찾기
      let maxMouthOpennessLabel = '';
      let maxMouthOpenness = 0;

      dataset.forEach(sdata => {
        if (sdata.mouthOpenness > maxMouthOpenness) {
          maxMouthOpenness = sdata.mouthOpenness;
          maxMouthOpennessLabel = matchingData.label;
        }
      });

      // mouthOpenness가 가장 큰 라벨을 찾았으면 결과 배열에 추가
      if (maxMouthOpennessLabel !== '') {
        resultArray.push({
          label: maxMouthOpennessLabel,
          word: transcriptionItem.word,
          startTime: transcriptionItem.startTime,
          endTime: transcriptionItem.endTime
        });
      }
    }
  });

  // 결과 배열 반환
  return resultArray;
}
