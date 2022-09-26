const client = require("./mqtt");
const _db = require('../mirror_db');

let signUpBtnFlag = false;
let btn; // 눌린 버튼 정보 저장
let btnText = "";

client.subscribe('error'); // face not found를 위한 토픽 : "error"
client.on('message', (topic, message, packet) => {
    if (topic == "error") {
        var msg = String(message);
        const warningText = "Face Not Found";

        if (signUpBtnFlag) { // Sign Up 버튼을 눌렀는데 얼굴이 안 보일 경우
            btn = document.getElementById("signUpBtn");
            btnText = "Sign Up";
            signUpBtnFlag = false;
        }

        if (msg == "notFound") { // 그 버튼에 Error 문구 띄우기
            btn.textContent = warningText;
            btn.setAttribute("style", "color: red; border: solid 3px red; box-shadow: 0 0 25px red;");
        }
        else { // 얼굴을 찾았을 경우 버튼 복구
            btn.textContent = btnText;
            btn.setAttribute("style", "color: white; border: solid 2px white;");
        }
    }
});
// Sign Up 버튼 눌렀을 때 사진 찍고 학습하기
function singUp() {
    const userName = document.getElementById('name').value;
    _db.addUser(userName)
        .then(value => {
            loading();
            signUpBtnFlag = true;
            id = value;
            document.getElementById('name_id').setAttribute('value', id);
            client.publish('createAccount/camera', String(id));

        });
}
// init로 돌아가기
function returnToHome() {
    window.history.back();
}