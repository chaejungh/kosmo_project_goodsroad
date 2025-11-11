const BASE = 'http://localhost:9090';
let token = localStorage.getItem('jwt');
let nickname = localStorage.getItem('nickname');

function authHeaders() {
    return token ? {'Authorization': `Bearer ${token}`} : {};
}

export function setAuth(t, n) {
    token = t;
    nickname = n;
    if (t) localStorage.setItem('jwt', t); else localStorage.removeItem('jwt');
    if (n) localStorage.setItem('nickname', n); else localStorage.removeItem('nickname');
}

export function getNickname() {
    return nickname || '게스트';
}

export const api = {
    async signup(email, password, nickname) {
        const r = await fetch(`${BASE}/api/auth/signup`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password, nickname})
        });
        return r.json();
    },
    async login(email, password) {
        const r = await fetch(`${BASE}/api/auth/login`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        return r.json();
    },
    async shops() {
        const r = await fetch(`${BASE}/api/shops`);
        return (await r.json()).data;
    },
    async products(params = {}) {
        const q = new URLSearchParams(params).toString();
        const r = await fetch(`${BASE}/api/products${q ? `?${q}` : ''}`);
        return (await r.json()).data;
    },
    async trades() {
        const r = await fetch(`${BASE}/api/trades`);
        return (await r.json()).data;
    },
    async createTrade(body) {
        const r = await fetch(`${BASE}/api/trades`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', ...authHeaders()},
            body: JSON.stringify(body)
        });
        return (await r.json()).data;
    },
    async reviews(productId) {
        const r = await fetch(`${BASE}/api/reviews?productId=${productId}`);
        return (await r.json()).data;
    },
    async createReview(body) {
        const r = await fetch(`${BASE}/api/reviews`, {
            method: 'POST', headers: {'Content-Type': 'application/json', ...authHeaders()},
            body: JSON.stringify(body)
        });
        return (await r.json()).data;
    }
};
