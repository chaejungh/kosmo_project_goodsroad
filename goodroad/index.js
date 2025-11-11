// 백엔드 주소
const API_URL = "http://localhost:9090/api/shops";

let map;
let markers = [];

// 지도 초기화
function initMap() {
    const mapContainer = document.getElementById("map");
    const mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 7,
    };
    map = new kakao.maps.Map(mapContainer, mapOption);

    loadShops();
}

// 매장 불러오기
async function loadShops() {
    try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (!json.success) throw new Error("데이터 없음");
        renderShops(json.data);
    } catch (err) {
        console.error(err);
    }
}

// 매장 렌더링
function renderShops(shops) {
    const list = document.getElementById("shops");
    list.innerHTML = "";
    markers.forEach(m => m.setMap(null));
    markers = [];

    const bounds = new kakao.maps.LatLngBounds();

    shops.forEach(shop => {
        const item = document.createElement("div");
        item.className = "item";
        item.innerHTML = `
      <strong>${shop.name}</strong>
      <div>${shop.category} · ${shop.address}</div>
    `;
        list.appendChild(item);

        const pos = new kakao.maps.LatLng(shop.lat, shop.lng);
        const marker = new kakao.maps.Marker({position: pos});
        marker.setMap(map);
        markers.push(marker);
        bounds.extend(pos);

        kakao.maps.event.addListener(marker, "click", () => {
            const iw = new kakao.maps.InfoWindow({
                content: `<div style="padding:6px 8px;">${shop.name}</div>`,
            });
            iw.open(map, marker);
        });
    });

    if (shops.length > 0) map.setBounds(bounds);
}

// 이벤트 연결
document.addEventListener("DOMContentLoaded", () => {
    initMap();

    document.getElementById("allBtn").addEventListener("click", loadShops);

    document.getElementById("searchBtn").addEventListener("click", async () => {
        const keyword = document.getElementById("searchInput").value.trim();
        if (!keyword) return alert("검색어를 입력하세요.");

        const res = await fetch(API_URL);
        const json = await res.json();
        const filtered = json.data.filter(shop =>
            shop.name.includes(keyword) || shop.category.includes(keyword)
        );
        renderShops(filtered);
    });
});