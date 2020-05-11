//"video"라는 아이디를 가진 html element를 불러옵니다.
const video = document.getElementById('video');

//Promise .all()에서 사용할 모델을 지정하고, .then()에서 모델이 로딩되면 startVideo 함수를 실행. 
Promise.all([
	//얼굴을 감지하기 위해 필요한 저용량 모델 로드 
	faceapi.nets.tinyFaceDetector.loadFromUri('models/'),
	//얼굴 랜드마크를 감지하기 위한 모델 로드
	faceapi.nets.faceLandmark68Net.loadFromUri('models/'),
]).then(startVideo);

//video에 웹캠 스트림을 넣어주는 기능을 수행한다.
function startVideo(){
	navigator.getUserMedia(
		{ video : {} },
		stream => video.srcObject = stream,
		err => console.error(err)
	);
}

var landmark_points; //모델이 결과로 내놓은 좌표점들을 저장할 변수

video.addEventListener('play', () => {
	//이후에 모델이 내놓는 점의 좌표들을 현재 비디오 화면 크기에 맞춰주기 위해 비디오 화면 크기를 얻는다.
	const displaySize = { width: video.width, height: video.height};
	//setInterval은 일정 시간을 간격으로 실행된다.
	setInterval(async () => {
		//모델의 예측 결과 추출 -> 현재 비디오 크기에 맞게 결과 조절 -> 예측결과가 있다면 landmark_points에 좌표값 저장.
		const detections = await faceapi.detectAllFaces(
			video,
			new faceapi.TinyFaceDetectorOptions()
		).withFaceLandmarks()
		const resizedDetections = faceapi.resizeResults(detections,displaySize);
		if(resizedDetections&&resizedDetections[0]){
			landmark_points = resizedDetections[0].landmarks._positions;
		}
	}, 50)
});


function setup(){
	//캔버스를 html 파일에서 지정한 비디오의 크기와 같게 생성
	createCanvas(720,540);
	//그리는 기하도형의 채움제거
	noFill();
	//획의 두께 2px
	strokeWeight(2);
}

function draw(){
	//이전 화면 지우기
	clear();
	//landmark_points에 값이 배정되었다면 각 좌표의 위치에 원과 직선을 순서대로 그린다.
	if(landmark_points){
		beginShape();
		for(let i=0; i<landmark_points.length; i++){
			let x = landmark_points[i]._x;
			let y = landmark_points[i]._y;
			ellipse(x,y,4,4);
			vertex(x,y);
		}
		endShape();
	}
}
