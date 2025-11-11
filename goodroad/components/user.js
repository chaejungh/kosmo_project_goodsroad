import {api, setAuth, getNickname} from '../api/http.js';
import {showModal, hideModal} from '../app.js';

export function authState() {
    const t = localStorage.getItem('jwt');
    const n = localStorage.getItem('nickname');
    return t && n ? {token: t, nickname: n} : null;
}

export function logout() {
    setAuth(null, null);
}

export function openLogin(onChange) {
    showModal(`<h3>로그인 / 회원가입</h3>
    <div class="f">
      <input id="email" placeholder="이메일" />
      <input id="pw" type="password" placeholder="비밀번호" />
      <input id="nick" placeholder="닉네임(회원가입 시)" />
      <div class="row" style="justify-content:flex-end">
        <button class="btn" id="signup">회원가입</button>
        <button class="btn" id="login">로그인</button>
        <button class="btn" id="guest">게스트</button>
      </div>
    </div>`);

    document.getElementById('signup').onclick = async () => {
        const email = v('email'), pw = v('pw'), nick = v('nick') || '유저';
        const j = await api.signup(email, pw, nick);
        if (!j.ok) return alert(j.error || '가입 실패');
        setAuth(j.data.token, j.data.nickname);
        hideModal();
        onChange && onChange();
    };
    document.getElementById('login').onclick = async () => {
        const email = v('email'), pw = v('pw');
        const j = await api.login(email, pw);
        if (!j.ok) return alert(j.error || '로그인 실패');
        setAuth(j.data.token, j.data.nickname);
        hideModal();
        onChange && onChange();
    };
    document.getElementById('guest').onclick = () => {
        alert('게스트로 계속 이용합니다. (일부 작성은 데모 계정으로 처리)');
        hideModal();
        onChange && onChange();
    };
}

function v(id) {
    return document.getElementById(id).value.trim();
}

export function currentNickname() {
    return getNickname();
}
