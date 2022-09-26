const mirror_db = require('../mirror_db');
const message_storage = require('./message_storage');
const message = require('./message');
const { io } = require("socket.io-client");
const fs = require('fs');
const moment = require('moment');


var socket = io('http://113.198.84.128:80/', { transports : ['websocket'] });

socket.on("connect", () => {
    console.log("connection socket server", mirror_db.getId());
});

function insert_socket_message(data){
    //DB에 저장
    mirror_db.createColumns('message', data)
    .then(() => {
        //메시지함에 새로 추가
        message_storage.showMessageStorage();
        //메인 ui 메시지 창에 추가
        message.insertNewMessage();
    })
}
function sub(){
    //나에게 서버로부터 메시지가 올 때
    socket.on(`${mirror_db.getId()}`, req => {

        console.log('소켓메시지 도착', req);
        var send_time = moment(req.send_time).format('YYYY-MM-DD HH:mm:ss');
        let data = {
            sender : req.sender,
            receiver : mirror_db.getId(),
            content : req.content,
            type : 'text',
            send_time : send_time
        };
        switch (req.type){
            case 'text':                   
                insert_socket_message(data)
                break;

            case 'image':
                new Promise((resolve, reject) =>{
                    
                    var folder = './image/message/'
                    var filename = new Date().getTime();
                    var url = req.content.split(',')[1];
                    var bstr = atob(url);
                    var n = bstr.length;
                    // base64 인코딩을 바이트 코드로 변환
                    var u8arr = new Uint8Array(n);

                    data.type = 'image'
                    data.content = filename
                    fs.open(folder + filename+'.jpg', 'w+', (err, fd)=>{
                    if(err)
                        console.log('open() fail');
                    else{
                        //파일 저장
                        fs.writeFile(folder + filename+'.jpg', u8arr, 'utf8', (err)=>{
                            if(err)
                                console.log('퍄일 쓰기 실패');
                        });
                    }      
                    })    
                    while(n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    resolve(filename);
                    //mesaage DB에 저장
                }).then(filename =>{
     
                        insert_socket_message(data)
                })
                break;
            case 'audio':
                new Promise((resolve, reject) =>{
                    var time = new Date().getTime();
                    var folder = './message_module/record/audio/client/';
                    var filename = time;
                    var n = req.content.length;
                    // base64 인코딩을 바이트 코드로 변환
                    var u8arr = new Uint8Array(n);  
                    
                    data.type = 'audio'
                    data.content = filename
                    fs.writeFile(folder + filename+ '.wav', u8arr, 'utf8', function (error) {
                        console.log("u8arr : " + u8arr);
                    });
                    while(n--) {
                        u8arr[n] = req.content.charCodeAt(n);
                    }
                    resolve(filename);
                    //mesaage DB에 저장
                }).then(filename =>{
                        insert_socket_message(data)
                })
            
        
        }

    });
}
socket.sub = sub;
module.exports = socket;