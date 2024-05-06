얼굴인식 활용 웹 어플리케이션
============================================================

목차 
---------------------
1. 어플리케이션 소개
2. 개발 일지
3. 소감문


---------------------
## 어플리케이션 소개 
http://main.projectgraphic.net./
https://www.youtube.com/watch?
해당 어플리케이션은 기존 자막프로그램에서는 말해주지 않던 누가 
말했는지를 알려줬으면 좋겠다 에서 착안하여 만든 기능입니다.    
먼저 프론트엔드에서 face-api를 호출하여 미리 
입력해놓은 이름에 따른 이미지를 학습합니다.   
학습이 끝나면 loaded를 화면에 출력해주고 사용자는 자막프롬프트를 받을 영상을 선택할수있게됩니다.   
입력된 영상은 face-api의 detection기능을 거쳐 콘솔창에 0.1초프레임마다    입열림정도와 label을 출력받게되고
영상이 끝나면 해당 데이터를 배열에 모아 서버로 전송합니다.   
전송된 데이터는 서버에서 처리를 거쳐 자막프롬프트로 변경됩니다.
완성된 자막프롬프트는  웹소켓프로그래밍을 통해 다시 사용자에게 .txt형태로 전해집니다.



---------------------------
## 소감문
* 김경오



* 김재형
 * * *

처음 프로젝트를 하면서 교수님이 수업에서 알려준 내용을 팀원들과 사진을 찍어서 얼굴인식이 적용되는걸
확인했을 때 다른 기능들도 써보고 싶었습니다 저의 경우는 ageAndGender Recognition 적용해보고 싶었습니다

교수님이 참고하라고 말한 유튜버의 코드에 faceapi.nets.ageGenderNet.loadFromUri('/models')을 추가하고 
성별의 그룹을 남녀로 나눠보고 나이별로 정렬을 하는 것을 만들어볼까? 생각을 했는데요

자바 스크립트 언어는 잘 모르는 상황이었기에 일단 일차적으로 챗gpt에게 조건을 말하고 코드를 짜보라고
해서 그걸 실행해보고 수정을 해가면 되지 않을까 생각을 했습니다 디버그를 했을 때 작동이 안되거나 하는 
부분은 없었지만 문제가 되었던 부분은 사진을 올려도 아무것도 전시되지 않는 것이 문제였습니다

이런 부분에서 어려움을 겪어서 이후로도 내가 놓친게 무엇일까 계속 찾아가봐야 할 것 같다는 생각이 들었습니다
* * *

* 신재민 

* * *

  Face-API를 활용하여 얼굴을 인식한 다음 landmarks를 활용해  등의 위치를 감지해 얼굴에 장식을 추가하거나 필터를 적용한
  다음 컴퓨터에 저장할 수 있는 시스템을 만들어보려 했으나 서버를 열고 이미지를 불러오는 부분에 오류가 발생했습니다.
  며칠씩 써가며 해당 문제를 해결하려고 노력했으나 끝내 잘 작동하지 않았고 기능 구현에 실패한 뒤 내가 할 수 있는 일을 찾아 이미 만들어진 코드를
  다듬고 팀원들과 의견을  수 있는 일을 찾아 개인적으로 도움이 되어주었습니다. 이렇게 복잡한 프로젝트는 처음이었는데
  다음에는 이런 프로젝트에도 잘 적응해 결과를 만들어보고 창의적인 프로젝트를 만들어보고 싶습니다.


* * *

* 전재민

* * *
face -api를 통해 동영상에서 입의 움직임을 파악하고  face api 뿐만아니라 다른 api를 활용한 웹 어플리케이션을 만들어보고 싶었습니다.
api를 찾던중에 저는 speech to text라는 구글 클라우드 기반의 api를 발견하게 되었고 이를 활용한 어플리케이션을 만들었습니다. 밑의 유튜브 주소는 제가 만든 어플리케이션의 로컬호스트 기반 웹을 소개하는 영상입니다. https://www.youtube.com/watch?v=3kakNQx9Kp8&ab_channel=%EC%A0%84%EC%9E%AC%EB%AF%BCjasmin 
다음주소는 웹서버 기반의 사이트 주소입니다 http://main.projectgraphic.net./ 해당 어플리케이션을 제작하며 정말 힘들었지만 이런과정이 너무재밌어서 이런 프로젝트를 할수있도록 기회를준 심재창 교수님께 감사합니다
* * *


