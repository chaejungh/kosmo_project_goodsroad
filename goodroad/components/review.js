import {api} from '../api/http.js';
import {authState} from './user.js';
import {showModal, hideModal} from '../app.js';

export async function loadReview(root) {
    root.innerHTML = `
    <section class="section">
      <div class="row">
        <input id="pid" placeholder="상품 ID (예: 1)" style="width:120px"/>
        <button id="load" class="btn">리뷰 불러오기</button>
        <button id="write" class="btn">리뷰 작성</button>
      </div>
      <div id="list" class="section"></div>
    </section>
  `;

    async function render(productId) {
        const rows = await api.reviews(productId);
        document.getElementById('list').innerHTML =
            rows.map(r => `<div class="card"><b>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</b><br>${r.content}</div>`).join('')
            || '<div class="card">리뷰가 없습니다.</div>';
    }

    document.getElementById('load').onclick = () => {
        const id = Number(document.getElementById('pid').value || 0);
        if (!id) return alert('상품 ID를 입력하세요');
        render(id);
    };

    document.getElementById('write').onclick = () => {
        const me = authState();
        if (!me) alert('로그인 없이도 데모로 작성됩니다 :)');
        showModal(`<h3>리뷰 작성</h3>
      <div class="f">
        <input id="rp" placeholder="상품 ID (예: 1)" />
        <input id="rr" placeholder="평점(1~5)" />
        <textarea id="rc" placeholder="내용"></textarea>
        <div class="row" style="justify-content:flex-end">
          <button class="btn" id="cancel">취소</button>
          <button class="btn" id="save">등록</button>
        </div>
      </div>`);
        document.getElementById('cancel').onclick = hideModal;
        document.getElementById('save').onclick = async () => {
            const pid = Number(v('rp') || 0), rating = Number(v('rr') || 0), content = v('rc');
            if (!pid || rating < 1 || rating > 5 || !content) return alert('입력값을 확인하세요');
            await api.createReview({productId: pid, rating, content});
            hideModal();
            if (Number(document.getElementById('pid').value) === pid) render(pid);
        };
    };
}

function v(id) {
    return document.getElementById(id).value.trim();
}
