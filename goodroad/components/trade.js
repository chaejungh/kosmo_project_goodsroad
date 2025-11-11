import {api} from '../api/http.js';
import {authState} from './user.js';
import {showModal, hideModal} from '../app.js';

export async function loadTrade(root) {
    root.innerHTML = `
    <section class="section">
      <div class="row" style="justify-content:space-between">
        <h3>중고거래</h3>
        <button id="newBtn" class="btn">판매 글 올리기</button>
      </div>
      <div id="tradeList" class="grid"></div>
    </section>
  `;

    async function render() {
        const items = (await api.trades()).slice().reverse();
        document.getElementById('tradeList').innerHTML = items.map(item => `
      <div class="card">
        <div class="row">
          <div class="thumb" style="width:96px;aspect-ratio:1;background-image:url('${item.image || 'https://picsum.photos/seed/goodsroad/400/400'}')"></div>
          <div style="flex:1">
            <div class="row" style="justify-content:space-between">
              <strong>${item.title}</strong><span>${(item.price || 0).toLocaleString()}원</span>
            </div>
            <div class="muted">${item.description || ''}</div>
          </div>
        </div>
      </div>`).join('') || '<div class="card">등록된 거래가 없습니다.</div>';
    }

    await render();

    document.getElementById('newBtn').onclick = () => {
        const me = authState();
        if (!me) alert('로그인 없이도 데모 계정으로 저장됩니다 :)');
        showModal(`<h3>판매 글 작성</h3>
      <div class="f">
        <input id="tTitle" placeholder="제목" />
        <input id="tPrice" placeholder="가격(숫자)" />
        <input id="tImage" placeholder="이미지 URL (선택)" />
        <textarea id="tDesc" placeholder="설명"></textarea>
        <div class="row" style="justify-content:flex-end">
          <button class="btn" id="cancel">취소</button>
          <button class="btn" id="save">등록</button>
        </div>
      </div>`);
        document.getElementById('cancel').onclick = hideModal;
        document.getElementById('save').onclick = async () => {
            await api.createTrade({
                title: g('tTitle'),
                price: Number(g('tPrice') || 0),
                image: g('tImage') || undefined,
                description: g('tDesc') || ''
            });
            hideModal();
            await render();
        };
    };
}

function g(id) {
    return document.getElementById(id).value.trim();
}
