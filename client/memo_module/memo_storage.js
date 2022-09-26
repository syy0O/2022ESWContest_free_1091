const _db = require('../mirror_db')
const moment = require('moment')


function showMemoStorage() {
    console.log('showMemoStorage');
    _db.select('*', 'memo', `id =${_db.getId()}`)
        .then(memos => {
            create_storage(memos);
        })
}

function create_storage(memos) {

    document.getElementById('memo_storage_contents').replaceChildren();
    for (var i = 0; i < memos.length; i++) {
        let memo = memos[i];
        var memo_div = document.createElement('div');
        memo_div.setAttribute('class', 'memo_storage_content');

        //content
        var memo_content = document.createElement('div');
        memo_content.setAttribute('class', 'memo_storage_content_context');
        memo_content.setAttribute('vlaue', memo.seq);

        //Date
        var memo_date = document.createElement('div');
        memo_date.setAttribute('class', 'memo_storage_content_date');
        memo_date.innerHTML = moment(memo.time).format('MM-DD');

        //content-innerHTML
        switch (memo.type) {
            case 'text':
                memo_content.innerHTML = memo.content;
                break;
            case 'image':
                memo_content.innerHTML = '(사진)';
                break;
            case 'audio':
                memo_content.innerHTML = '(음성 메시지)';
        }
        memo_div.appendChild(memo_date);
        memo_div.appendChild(memo_content);
        memo_content.addEventListener("click", () => { memo_storage_detail(memo.seq) });
        document.getElementById('memo_storage_contents').prepend(memo_div);
    }

}

function memo_storage_detail(seq) {

    _db.select('*', 'memo', `id=${_db.getId()} and seq=${seq}`)
        .then((memo) => {
            var memo = memo[0];
            let content = document.getElementById('memo_storage_detail_content')
            let context = document.getElementById('memo_storage_detail_context');
            let date = document.getElementById('memo_storage_detail_date');
            context.textContent = '';

            //date, time
            date.innerHTML = moment(memo.time).format('MM-DD HH:mm');

            //context
            switch (memo.type) {
                case 'text':
                    context.innerHTML = memo.content;
                    break;
                case 'image':
                    let img = document.createElement('img');
                    //폴더 수정 여부 체크
                    img.src = './memo_module/image/' + memo.content + '.jpg';
                    context.appendChild(img);
                    break;
                case 'audio':
                    var audio_folder = './memo_module/record/';
                    var audio = document.createElement('audio');
                    audio.setAttribute('id', 'storage-audio');
                    audio.controls = 'controls';
                    audio.src = audio_folder + memo.content + '.wav';
                    context.appendChild(audio);
                    break;

            }
            content.appendChild(context);
            content.appendChild(date);
        })
}
module.exports = { showMemoStorage }