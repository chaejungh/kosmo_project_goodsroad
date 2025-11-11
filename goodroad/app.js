// ====== 기본 설정 ======
const BASE_URL = "http://localhost:9090";
const API_SHOPS = `${BASE_URL}/api/shops`;

const state = {
    map: null,
    markers: [],
    infowindow: null,
    allShops: [],
};

// ====== 유틸 ======
function $(sel) {
    return document.querySelector(sel);
}

function createEl(tag, cls) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
}

// ====== 지도 & 마커 ======
function initMap() {
    const container = document.getElementById("map");
    const center = new kakao.maps.LatLng(37.5665, 126.9780); // 서울
    state.map = new kakao.maps.Map(container, {
        center,
        level: 7
    });
    state.infowindow = new kakao.maps.InfoWindow({zIndex: 1});
}

function clearMarkers() {
    state.markers.forEach(m => m.setMap(null));
    state.markers = [];
}

function addMarkers(shops) {
    clearMarkers();
    shops.forEach(shop => {
        const pos = new kakao.maps.LatLng(shop.lat, shop.lng);
        const marker = new kakao.maps.Marker({position: pos});
        marker.setMap(state.map);

        kakao.maps.event.addListener(marker, 'click', () => {
            state.infowindow.setContent(
                `<div style="padding:8px 10px;font-weight:700">${shop.name}</div>`
            );
            state.infowindow.open(state.map, marker);
            state.map.panTo(pos);
        });

        state.markers.push(marker);
    });

    // 마커들 Bounds 맞추기
    if (shops.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();
        shops.forEach(s => bounds.extend(new kakao.maps.LatLng(s.lat, s.lng)));
        state.map.setBounds(bounds, 40, 40, 40, 40);
    }
}

// ====== 리스트 렌더 ======
function renderList(shops) {
    const ul = $("#shopList");
    ul.innerHTML = "";
    if (!shops || shops.length === 0) return;

    shops.forEach(s => {
        const li = createEl("li", "shop-item");
        li.innerHTML = `
      <div class="shop-name">${s.name}</div>
      <div class="shop-sub">${s.category} · ${s.address}</div>
    `;
        li.addEventListener("click", () => {
            const pos = new kakao.maps.LatLng(s.lat, s.lng);
            state.map.panTo(pos);
            state.infowindow.setContent(
                `<div style="padding:8px 10px;font-weight:700">${s.name}</div>`
            );
            // 해당 마커에 인포윈도우 붙이기(가장 가까운 마커 찾기)
            const mk = state.markers.find(m =>
                m.getPosition().getLat() === s.lat && m.getPosition().getLng() === s.lng
            );
            if (mk) state.infowindow.open(state.map, mk);
        });
        ul.appendChild(li);
    });
}

// ====== 데이터 로드 ======
async function fetchShops() {
    const res = await fetch(API_SHOPS);
    if (!res.ok) throw new Error("매장 목록을 불러오지 못했어요.");
    const json = await res.json(); // {success, data:[...]}
    return json?.data ?? [];
}

function filterShops(keyword) {
    const k = keyword.trim().toLowerCase();
    if (!k) return state.allShops;
    return state.allShops.filter(s =>
        s.name.toLowerCase().includes(k) ||
        s.category.toLowerCase().includes(k) ||
        s.address.toLowerCase().includes(k)
    );
}

// ====== 내 위치 이동(선택) ======
function goMyLocation() {
    if (!navigator.geolocation) {
        alert("브라우저가 위치 정보를 지원하지 않아요 🥲");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const {latitude, longitude} = pos.coords;
            const here = new kakao.maps.LatLng(latitude, longitude);
            state.map.setLevel(5);
            state.map.panTo(here);

            const me = new kakao.maps.Marker({position: here});
            me.setMap(state.map);
            state.infowindow.setContent(`<div style="padding:6px 8px">내 위치</div>`);
            state.infowindow.open(state.map, me);
        },
        () => alert("현재 위치를 가져오지 못했어요.")
    );
}

// ====== 이벤트 바인딩 ======
function bindUI() {
    $("#backendUrl").textContent = BASE_URL;

    $("#btnSearch").addEventListener("click", () => {
        const keyword = $("#keyword").value;
        const list = filterShops(keyword);
        renderList(list);
        addMarkers(list);
    });

    $("#keyword").addEventListener("keydown", (e) => {
        if (e.key === "Enter") $("#btnSearch").click();
    });

    $("#btnAll").addEventListener("click", () => {
        $("#keyword").value = "";
        renderList(state.allShops);
        addMarkers(state.allShops);
    });

    // 옵션: 내 위치 버튼을 쓰고 싶다면 아래 두 줄 활성화 + index.html에 버튼 추가해도 됨
    // const myBtn = document.createElement('button'); myBtn.textContent='내 위치'; myBtn.className='btn ghost';
    // document.querySelector('.search-row').appendChild(myBtn); myBtn.addEventListener('click', goMyLocation);
}

// ====== 시작 ======
kakao.maps.load(async () => {
    try {
        initMap();
        bindUI();
        state.allShops = await fetchShops();     // 백엔드에서 목록 로드
        renderList(state.allShops);              // 리스트
        addMarkers(state.allShops);              // 마커
    } catch (e) {
        console.error(e);
        alert(e.message || "초기화 중 오류가 발생했어요.");
    }
});