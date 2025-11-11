import {api} from '../api/http.js';

export async function loadHome(root) {
    root.innerHTML = `
    <section class="section">
      <div class="searchbar">
        <input id="q" placeholder="키워드(예: 주술회전, 피규어, 홍대 카페)" />
        <button id="qbtn">검색</button>
        <button id="here" class="btn">내 위치</button>
      </div>
      <div class="map-wrap" id="map"></div>

      <h3>오늘의 매장</h3>
      <div id="shopList" class="grid"></div>

      <h3>추천 상품</h3>
      <div id="recList" class="grid"></div>
    </section>
  `;

    const map = new kakao.maps.Map(document.getElementById('map'), {
        center: new kakao.maps.LatLng(37.5665, 126.9780), level: 6
    });
    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);

    const clusterer = new kakao.maps.MarkerClusterer({map, averageCenter: true, minLevel: 6, disableClickZoom: true});
    const infowindow = new kakao.maps.InfoWindow({zIndex: 2});

    const shops = await api.shops();
    const shopMarkers = shops.map(s => {
        const pos = new kakao.maps.LatLng(s.lat, s.lng);
        const marker = new kakao.maps.Marker({position: pos});
        kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.setContent(`<div style="padding:6px 8px">
        <b>${s.name}</b><br/><span style="color:#666">${s.addr || ''}</span><br/>
        <a target="_blank" href="https://map.kakao.com/link/to/${encodeURIComponent(s.name)},${s.lat},${s.lng}">길찾기</a>
      </div>`);
            infowindow.open(map, marker);
        });
        return marker;
    });
    clusterer.addMarkers(shopMarkers);

    document.getElementById('shopList').innerHTML = shops.map(s => `
    <div class="card">
      <div class="row" style="justify-content:space-between">
        <div><strong>${s.name}</strong><div class="muted">${s.addr || ''}</div></div>
        <button class="btn" data-to="${s.lat},${s.lng}">보기</button>
      </div>
    </div>`).join('');
    document.querySelectorAll('[data-to]').forEach(btn => {
        btn.addEventListener('click', () => {
            const [lat, lng] = btn.dataset.to.split(',').map(Number);
            map.setLevel(4);
            map.panTo(new kakao.maps.LatLng(lat, lng));
        });
    });

    document.getElementById('here').onclick = () => {
        if (!navigator.geolocation) return alert('위치 미지원 브라우저');
        navigator.geolocation.getCurrentPosition(({coords}) => {
            const pos = new kakao.maps.LatLng(coords.latitude, coords.longitude);
            map.setLevel(4);
            map.panTo(pos);
            const me = new kakao.maps.Marker({position: pos, map});
            new kakao.maps.InfoWindow({content: '<div style="padding:5px">내 위치</div>'}).open(map, me);
        }, () => alert('위치 권한을 허용해주세요.'));
    };

    const places = new kakao.maps.services.Places();
    let searchMarkers = [];

    function clearSearch() {
        searchMarkers.forEach(m => m.setMap(null));
        searchMarkers = [];
    }

    document.getElementById('qbtn').onclick = () => {
        const q = document.getElementById('q').value.trim();
        if (!q) return alert('검색어를 입력하세요.');
        places.keywordSearch(q, (data, status) => {
            if (status !== kakao.maps.services.Status.OK) {
                clearSearch();
                clusterer.redraw();
                return alert('검색 결과가 없습니다.');
            }
            clearSearch();
            const bounds = new kakao.maps.LatLngBounds();
            data.slice(0, 20).forEach(p => {
                const pos = new kakao.maps.LatLng(Number(p.y), Number(p.x));
                const m = new kakao.maps.Marker({position: pos});
                kakao.maps.event.addListener(m, 'click', () => {
                    infowindow.setContent(`<div style="padding:6px 8px">
            <b>${p.place_name}</b><br/><span style="color:#666">${p.road_address_name || p.address_name}</span><br/>
            <a target="_blank" href="https://map.kakao.com/link/to/${encodeURIComponent(p.place_name)},${p.y},${p.x}">길찾기</a>
          </div>`);
                    infowindow.open(map, m);
                });
                searchMarkers.push(m);
                bounds.extend(pos);
            });
            clusterer.addMarkers(searchMarkers);
            map.setBounds(bounds);
        }, {page: 1, size: 15});
    };

    const rec = (await api.products()).slice(0, 8);
    document.getElementById('recList').innerHTML = rec.map(p => `
    <div class="card product">
      <div class="thumb" style="background-image:url('${p.image}')"></div>
      <div class="row" style="justify-content:space-between">
        <div><strong>${p.title}</strong><div class="muted">${(p.price || 0).toLocaleString()}원</div></div>
        <span class="badge ${p.inStock ? '' : 'out'}">${p.inStock ? '재고있음' : '품절'}</span>
      </div>
    </div>`).join('');
}
