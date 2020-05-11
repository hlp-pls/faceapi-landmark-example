
const video = document.getElementById('video');

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('models/'),
	faceapi.nets.faceLandmark68Net.loadFromUri('models/'),
	//faceapi.nets.faceRecognition.loadFromUri('/models'),
	//faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo(){
	navigator.getUserMedia(
		{ video : {} },
		stream => video.srcObject = stream,
		err => console.error(err)
	);
}

var landmark_points;
var offset;

video.addEventListener('play', () => {
	const displaySize = { width: video.width, height: video.height};
	//setInterval은 일정 시간을 간격으로 실행된다.
	setInterval(async () => {
		const detections = await faceapi.detectAllFaces(
			video,
			new faceapi.TinyFaceDetectorOptions()
		).withFaceLandmarks()
		//console.log(detections)
		//console.log(detections[0].landmarks)
		const resizedDetections = faceapi.resizeResults(detections,displaySize);
		if(resizedDetections&&resizedDetections[0]){
			landmark_points = resizedDetections[0].landmarks._positions;
			offset = resizedDetections[0].landmarks._shift;
			//console.log(resizedDetections[0].landmarks._shift);
		}
	}, 50)
});


function setup(){
	createCanvas(720,540);
	noFill();
	strokeWeight(2);
}

function draw(){
	clear();
	if(landmark_points){
		beginShape();
		for(let i=0; i<landmark_points.length; i++){
			let x = landmark_points[i]._x;
			let y = landmark_points[i]._y;
			ellipse(x,y,4,4);
			vertex(x,y);
		}
		endShape();

		ellipse(offset._x,offset._y,20,20);
	}

	
	//console.log(landmark_points);
}
