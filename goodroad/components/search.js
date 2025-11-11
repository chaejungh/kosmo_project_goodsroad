import {api} from '../api/http.js';

export async function loadSearch(root) {
    const all = await api.products();

    root.innerHTML = `
  <section class="section">
    <div class="row">
      <input id="q2" placeholder="애니/상품명/태그로 검색"/>
      <select id="cat">
        <option value="">전체 카테고리</option>
        <option>피규어</option><option>포토카드</option><option>의류</option><option>잡화</option>
      </select>
      <button id="sbtn" class="btn">검색</button>
    </div>
    <div class="grid" id="results"></div>
  </section>`;

    function render(list) {
        document.getElementById('results').innerHTML =
            list.map(p => card(p)).join('') || '<div class="card">검색 결과가 없습니다.</div>';
    }

    render(all);

    document.getElementById('sbtn').onclick = async () => {
        const q = document.getElementById('q2').value.trim();
        const cat = document.getElementById('cat').value;
        const res = await api.products(q ? {q} : {});
        render(res.filter(p => cat ? p.category === cat : true));
    };
}

function card(p) {
    return `<div class="card product">
    <div class="thumb" style="background-image:url('${p.image}')"></div>
    <div><strong>${p.title}</strong></div>
    <div class="row" style="justify-content:space-between">
      <div class="muted">${(p.price || 0).toLocaleString()}원 · ${p.category || ''}</div>
      <button class="btn" onclick="alert('상세는 다음 단계에서!')">상세보기</button>
    </div>
  </div>`;
}
