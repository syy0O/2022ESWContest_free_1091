client = require('./mqtt')
_db = require('../mirror_db')
const loading = require('./loading')
var id
var ids =[];
var names=[];   


client.subscribe("delete/login/check") 
client.subscribe('delete/folder/check')

client.on('message', (topic, message, packet) => {
    console.log("message is "+ message);
    console.log("topic is "+ topic);
    
    if(topic == 'delete/login/check'){
      getId = String(message)
      if(id  == getId){
        loading.loading();
        //얼굴 인식 서버에게 해당 아이디의 폴더를 삭제하라고 보내기
        mirror_id = _db.getMirror_id()
        client.publish('delete/folder',String(mirror_id) + String(id))
        textDiv = document.getElementById('delete_msg')
        del_msg('삭제 중 입니다...')
        
      }
      else{
        loading.stopLoading();
        del_msg('삭제할 수 없습니다...')          
      }
    }

    if(topic == 'delete/folder/check'){
        id = String(message)
        loading.loading();

        console.log('서버에서 폴더 삭제 성공')
        _db.select('id', 'user', `id =${id}`)
        .then(user =>{
            console.log(user.length);
          if( user.length > 0) {
            del_msg('삭제 됐습니다...')
            loading.stopLoading();
            // delete
            console.log(user[0].user_id)
            _db.delete('user', `id =${user[0].id}` )
            //테이블 다시 생성
            getUserInfo();
            //모델 재학습
            client.publish('reTrain', String(_db.getMirror_id()))
          }else{
             del_msg('삭제 할 수 없습니다.')
          }
     
        })
    }
 }
)

function getUserInfo(){
  ids =[];
  names=[];   
  _db.select('*', 'user', 'id is not null')
  .then(users =>{
      users.forEach(user => {
          ids.push(user.id)
          names.push(user.name)    
      });
      createTable(ids, names)
  })
}

function createTable(ids, names){
  const hTbody = document.getElementById('htmlTbody');
  hTbody.textContent =''
  names.forEach(name =>{
      let tr = document.createElement("tr")
      let td = document.createElement("td")
      td.innerHTML = name
      tr.setAttribute('onClick', "change_background(this)")
      tr.appendChild(td)
      hTbody.appendChild(tr)
      console.log(hTbody)
  }); 
  rowEvent()
}

function change_background(target) {
  var trs = document.getElementsByTagName('tr')
  for ( var i = 0; i < trs.length; i++ ) {
      if ( trs[i] != target ) {
      trs[i].style.backgroundColor = '#000000';
      trs[i].style.color = '#ffffff';
      } else {
  trs[i].style.backgroundColor = '#ffffff';
  trs[i].style.color = '#000000';
  }
} // endfor i
}
function deleteUser(){
  if(deleteName != null){
      index = names.indexOf(deleteName, 0)
      id = ids[index]
      deleteClick(id)
  }
}
function rowEvent(){
// 테이블의 Row 클릭시 값 가져오기
  $("#table-1 tr").mousedown(function(){ 	

    // 현재 클릭된 Row(<tr>)
    var tr = $(this);
    var td = tr.children();
    var name = td.eq(0).text();
    deleteName = name

  });

}
// Home으로 돌아가기
function returnToHome(){
  window.history.back();
}

//삭제 버튼 누르면 login 실행
function deleteClick(user_id){
    id = String(user_id)
    client.publish('delete/camera', String(_db.getMirror_id()))
}

function del_msg(msg){
  let delete_msg = document.getElementById('delete_msg');
  if(delete_msg != null){
    delete_msg.innerHTML = `<h3>${msg}</h3>`
  }
}
function returnToLogin(){
  document.location.href="home.html";
}
module.exports =  {deleteClick}