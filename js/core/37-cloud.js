/* Cloud accounts (Firebase Authentication + Firestore).

   This module is dormant unless 36-cloud-config.js holds a complete
   configuration. When it is on:
   - username + password accounts live in Firebase (passwords are hashed there,
     never stored by this app)
   - the whole app state (bookmarks, history, themes, settings, profile picture)
     is copied to a private Firestore document owned by that account
   - an existing account can link a Google account and then sign in either way

   A username is mapped to a stable sign-in address so it can be used on any
   device without exposing anybody's real email address. */
(() => {
  'use strict';

  const SDK = '10.12.2';
  const EMAIL_DOMAIN = '@users.disease-atlas.invalid';
  const REDIRECT_FLAG = 'daGRedirect';

  const cfg = () => window.DA_CLOUD || {};
  const configured = () => {
    const c = cfg();
    return !!(c.apiKey && c.authDomain && c.projectId && c.appId);
  };

  const emailFor = value => {
    const name = String(value == null ? '' : value).trim().toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .replace(/^[._-]+|[._-]+$/g, '');
    return name ? name + EMAIL_DOMAIN : '';
  };

  const sessionId = () => {
    try { return localStorage.getItem('daSess') || ''; } catch (e) { return ''; }
  };
  const cloudUid = () => {
    const id = sessionId();
    return id.indexOf('c_') === 0 ? id.slice(2) : '';
  };
  const stateKey = () => {
    const id = sessionId();
    return id ? 'da_u_' + id : 'da';
  };
  const readState = () => {
    try { return JSON.parse(localStorage.getItem(stateKey()) || '{}') || {}; } catch (e) { return {}; }
  };

  window.DA = window.DA || {};
  window.DA.cloud = { configured, emailFor, cloudUid, stateKey };
  window.daCloudReady = configured;

  if (!configured()) return;

  let sdkPromise = null;
  let pushTimer = 0;
  let dirty = false;
  let applying = false;
  let suppress = false;
  let localSignIn = null;

  const script = src => new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = resolve;
    el.onerror = () => reject(new Error('Could not reach the cloud service. Check your connection.'));
    document.head.appendChild(el);
  });

  function loadSdk() {
    if (sdkPromise) return sdkPromise;
    sdkPromise = (async () => {
      if (!(window.firebase && window.firebase.app)) {
        await script('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-app-compat.js');
      }
      if (!(window.firebase && window.firebase.auth)) {
        await script('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-auth-compat.js');
      }
      if (!(window.firebase && window.firebase.firestore)) {
        await script('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-firestore-compat.js');
      }
      if (!firebase.apps.length) firebase.initializeApp(cfg());
      const auth = firebase.auth();
      const db = firebase.firestore();
      try { await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); } catch (e) {}
      return { firebase, auth, db };
    })().catch(err => { sdkPromise = null; throw err; });
    return sdkPromise;
  }

  const MESSAGES = {
    'auth/invalid-credential': 'That username and password do not match.',
    'auth/invalid-login-credentials': 'That username and password do not match.',
    'auth/wrong-password': 'That username and password do not match.',
    'auth/user-not-found': 'That username and password do not match.',
    'auth/email-already-in-use': 'That username is already registered. Try signing in instead.',
    'auth/weak-password': 'Use a password of at least 8 characters.',
    'auth/too-many-requests': 'Too many attempts. Wait a minute, then try again.',
    'auth/network-request-failed': 'No internet connection. Connect and try again.',
    'auth/operation-not-allowed': 'Cloud sign-in is not switched on yet. Check the Firebase setup.',
    'auth/configuration-not-found': 'Cloud sign-in is not switched on yet. Enable Email/Password and Google in Firebase Authentication.',
    'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site.',
    'auth/popup-closed-by-user': '',
    'auth/cancelled-popup-request': '',
    'auth/credential-already-in-use': 'That Google account is already linked to a different Disease Atlas account.',
    'auth/provider-already-linked': 'Google is already linked to this account.',
    'auth/requires-recent-login': 'Sign out, sign in again, then link Google.',
    'auth/unauthorized-domain': 'This website address is not allowed in Firebase yet. Add it under Authentication, Settings, Authorized domains.',
    'auth/invalid-api-key': 'The Firebase settings are not correct.',
    'permission-denied': 'The cloud database refused this request. Check the Firestore rules.',
    'unavailable': 'The cloud database is unreachable. Try again in a moment.',
    'failed-precondition': 'The cloud database is not set up yet.'
  };

  const cloudMsg = err => {
    const code = (err && (err.code || err.message)) || '';
    if (MESSAGES[code] !== undefined) return MESSAGES[code];
    if (/permission|insufficient/i.test(code)) return MESSAGES['permission-denied'];
    return (err && err.message) || 'Something went wrong. Try again.';
  };

  const fail = (el, msg) => { if (el) el.textContent = msg; };

  const authBox = () => {
    const si = document.getElementById('msi');
    const su = document.getElementById('msu');
    if (si && si.classList.contains('open')) return document.getElementById('sie');
    if (su && su.classList.contains('open')) return document.getElementById('sue2');
    return null;
  };

  const say = msg => {
    if (!msg) return;
    const el = authBox();
    if (el) { el.style.color = '#f87171'; el.textContent = msg; }
  };

  const setStatus = (msg, kind) => {
    const el = document.getElementById('cloudstat');
    if (!el) return;
    el.style.color = kind === 'bad' ? '#f87171' : (kind === 'good' ? '#4ade80' : '#94a3b8');
    el.textContent = msg;
  };

  function enter(user, profile) {
    const p = profile || {};
    return (async () => {
      let fb = null;
      let remote = null;
      let readOk = false;
      let writeOk = false;
      try { fb = await loadSdk(); } catch (e) {}
      if (fb) {
        try {
          const snap = await fb.db.collection('users').doc(user.uid).get();
          readOk = true;
          if (snap.exists) remote = snap.data() || {};
        } catch (e) {}
      }
      const state = Object.assign({}, remote || S, {
        uid: 'c_' + user.uid,
        un: (remote && remote.un) || p.un || user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
        updatedAt: (remote && remote.updatedAt) || Date.now()
      });
      if (p.email) state.em = p.email;
      if (p.dob) state.dob = p.dob;
      if (p.g) state.g = p.g;
      if (p.google) state.google = 1;
      if (p.hasPass) state.hasPass = 1;
      if (!remote && fb && readOk) {
        try {
          await fb.db.collection('users').doc(user.uid).set(state);
          writeOk = true;
        } catch (e) {}
      }
      if (readOk || writeOk) state.__synced = 1;
      suppress = true;
      try {
        localStorage.setItem('da_u_c_' + user.uid, JSON.stringify(state));
        localStorage.setItem('daSess', 'c_' + user.uid);
      } catch (e) {}
      location.reload();
    })();
  }

  async function signIn() {
    const err = document.getElementById('sie');
    const username = (document.getElementById('siu').value || '').trim();
    const pass = document.getElementById('sip').value;
    err.textContent = '';
    if (!username || !pass) return fail(err, 'Enter your username and password.');
    if (username.indexOf('@') !== -1) return fail(err, 'Use your username, not your email address.');
    const btn = document.getElementById('sigo');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    try {
      const fb = await loadSdk();
      const cred = await fb.auth.signInWithEmailAndPassword(emailFor(username), pass);
      await enter(cred.user, {});
    } catch (e) {
      btn.disabled = false;
      btn.textContent = label;
      fail(err, cloudMsg(e));
    }
  }

  async function signUp() {
    const err = document.getElementById('sue2');
    const username = (document.getElementById('suu').value || '').trim();
    const email = (document.getElementById('sue').value || '').trim();
    const noEmail = document.getElementById('sun').checked;
    const dob = document.getElementById('sud').value;
    const gender = document.getElementById('sug').dataset.v || '';
    const pass = document.getElementById('sup').value;
    const confirm = document.getElementById('suc').value;
    err.textContent = '';

    if (username.length < 3) return fail(err, 'Choose a username of at least 3 characters.');
    if (!/^[\w.-]+$/.test(username)) return fail(err, 'Usernames may use letters, numbers, dots, dashes and underscores.');
    if (!emailFor(username)) return fail(err, 'Choose a username that includes letters or numbers.');
    if (!noEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail(err, 'Enter a valid email, or tick the box to continue without one.');
    if (!dob) return fail(err, 'Date of birth is required.');
    const age = ageOf(dob);
    if (isNaN(age) || new Date(dob) > new Date() || age > 120) return fail(err, 'Enter a valid date of birth.');
    if (age < 13) return fail(err, 'You must be at least 13 years old to create an account.');
    if (pass.length < 8) return fail(err, 'Use a password of at least 8 characters.');
    if (pass !== confirm) return fail(err, 'The passwords do not match.');

    const btn = document.getElementById('suok');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Creating account…';
    try {
      const fb = await loadSdk();
      const cred = await fb.auth.createUserWithEmailAndPassword(emailFor(username), pass);
      try { await cred.user.updateProfile({ displayName: username }); } catch (e) {}
      await enter(cred.user, { un: username, email: noEmail ? '' : email, dob, g: gender, hasPass: 1 });
    } catch (e) {
      btn.disabled = false;
      btn.textContent = label;
      fail(err, cloudMsg(e));
    }
  }

  async function cloudGoogle() {
    const btn = document.querySelector('#msi .gbtn, #msu .gbtn');
    if (btn) btn.disabled = true;
    try {
      const fb = await loadSdk();
      const provider = new fb.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await fb.auth.signInWithPopup(provider);
      await enter(result.user, { google: 1, email: result.user.email || '', un: result.user.displayName || '' });
    } catch (e) {
      if (e && e.code === 'auth/popup-blocked') {
        try {
          localStorage.setItem(REDIRECT_FLAG, '1');
          const fb = await loadSdk();
          await fb.auth.signInWithRedirect(new fb.firebase.auth.GoogleAuthProvider());
          return;
        } catch (e2) {}
      }
      if (btn) btn.disabled = false;
      say(cloudMsg(e));
    }
  }

  async function linkGoogle() {
    setStatus('Opening Google…');
    try {
      const fb = await loadSdk();
      const user = fb.auth.currentUser;
      if (!user) throw new Error('Sign in again, then link Google.');
      const data = await user.linkWithPopup(new fb.firebase.auth.GoogleAuthProvider());
      S.google = 1;
      const provider = (data.user.providerData || []).filter(p => p.providerId === 'google.com')[0];
      S.gem = provider ? provider.email : '';
      save();
      setStatus('Google is linked. You can now sign in with Google or your username.', 'good');
      paint();
    } catch (e) {
      setStatus(cloudMsg(e), 'bad');
    }
  }

  async function unlinkGoogle() {
    try {
      const fb = await loadSdk();
      const user = fb.auth.currentUser;
      if (!user) throw new Error('Sign in again, then try again.');
      const hasPassword = (user.providerData || []).some(p => p.providerId === 'password');
      if (!hasPassword) throw new Error('Set a password before removing Google, or you will lose access.');
      await user.unlink('google.com');
      S.google = 0;
      S.gem = '';
      save();
      setStatus('Google is no longer linked.', 'good');
      paint();
    } catch (e) {
      setStatus(cloudMsg(e), 'bad');
    }
  }

  function paint() {
    if (!document.getElementById('cloudui')) return;
    if (!cloudUid()) {
      if (typeof loggedIn === 'function' && loggedIn()) {
        setStatus('This account is saved on this device only. Sign out to use a cloud account.');
      } else {
        setStatus('Sign in to save your account and progress in the cloud.');
      }
      paintButtons(true, true);
      return;
    }
    if (!S.__synced) {
      setStatus('Signed in, but cloud storage is not available yet. Check the Firebase setup.', 'bad');
      paintButtons(!!S.google, true);
      return;
    }
    const name = S.un || 'User';
    if (S.google) {
      setStatus('Cloud account: ' + name + ' — Google is linked.');
      paintButtons(true, !S.hasPass);
    } else {
      setStatus('Cloud account: ' + name + ' — Google is not linked.');
      paintButtons(false, true);
    }
  }

  function paintButtons(hideLink, hideUnlink) {
    const link = document.getElementById('cloudlink');
    const unlink = document.getElementById('cloudunlink');
    if (link) link.hidden = hideLink;
    if (unlink) unlink.hidden = hideUnlink;
  }

  function paintLocal() {
    const btn = document.getElementById('silocal');
    if (!btn) return;
    let count = 0;
    try { count = Object.keys(US()).length; } catch (e) {}
    btn.hidden = !count;
  }

  function notes() {
    const a = document.getElementById('sinote');
    const b = document.getElementById('sunote');
    if (a) a.textContent = 'Your account is stored in the cloud, so it works on any device.';
    if (b) b.textContent = 'Your account is stored securely in the cloud. Date of birth and gender are kept private and are never shown.';
    const label = document.querySelector('#msi label');
    if (label && /username or email/i.test(label.textContent)) label.textContent = 'Username';
  }

  function inject() {
    const panel = document.querySelector('#mset > div');
    if (!panel || document.getElementById('cloudui')) return;
    const html =
      '<div id="cloudui" style="margin-top:14px;border-top:1px solid var(--bd);padding-top:12px">' +
        '<label>Cloud account</label>' +
        '<p class="note" id="cloudstat" style="color:#94a3b8"></p>' +
        '<button type="button" id="cloudlink" style="width:100%" hidden>Link a Google account</button>' +
        '<button type="button" id="cloudunlink" style="width:100%;margin-top:8px" hidden>Unlink Google</button>' +
      '</div>';
    const buttons = Array.prototype.slice.call(panel.querySelectorAll('button'));
    const close = buttons.filter(b => /Close/.test(b.textContent))[0];
    if (close) close.insertAdjacentHTML('beforebegin', html);
    else panel.insertAdjacentHTML('beforeend', html);
    const link = document.getElementById('cloudlink');
    const unlink = document.getElementById('cloudunlink');
    if (link) link.onclick = linkGoogle;
    if (unlink) unlink.onclick = unlinkGoogle;
  }

  function injectLocal() {
    const panel = document.querySelector('#msi > div');
    const main = document.getElementById('sigo');
    if (!panel || !main || document.getElementById('silocal')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'silocal';
    btn.style.cssText = 'width:100%;margin-top:8px';
    btn.textContent = 'Use an account saved on this device';
    btn.hidden = true;
    main.parentNode.insertBefore(btn, main.nextSibling);
    btn.onclick = () => { if (localSignIn) localSignIn.call(main); };
  }

  function schedulePush() {
    if (!cloudUid()) return;
    dirty = true;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, 1500);
  }

  async function push() {
    const uid = cloudUid();
    if (!uid) return;
    let data;
    try { data = JSON.parse(localStorage.getItem(stateKey()) || '{}'); } catch (e) { return; }
    if (!data || data.__synced !== 1) return;
    try {
      const fb = await loadSdk();
      if (!fb.auth.currentUser || fb.auth.currentUser.uid !== uid) return;
      data.updatedAt = Date.now();
      data.uid = 'c_' + uid;
      await fb.db.collection('users').doc(uid).set(data);
      applying = true;
      try { localStorage.setItem(stateKey(), JSON.stringify(data)); } catch (e) {}
      applying = false;
      dirty = false;
    } catch (e) {
      dirty = true;
    }
  }

  async function pull() {
    const uid = cloudUid();
    if (!uid) return;
    let fb;
    try { fb = await loadSdk(); } catch (e) { return; }
    if (!fb.auth.currentUser || fb.auth.currentUser.uid !== uid) return;
    try {
      const snap = await fb.db.collection('users').doc(uid).get();
      if (!snap.exists) return;
      const remote = snap.data() || {};
      const local = readState();
      if ((remote.updatedAt || 0) > (local.updatedAt || 0) + 1500) {
        applying = true;
        try {
          Object.keys(S).forEach(k => { if (!(k in remote)) delete S[k]; });
          Object.assign(S, DA.validateState(remote));
          S.uid = 'c_' + uid;
          S.__synced = 1;
          try { localStorage.setItem(stateKey(), JSON.stringify(S)); } catch (e) {}
          if (typeof applyS === 'function') applyS();
          if (typeof renderP === 'function') renderP();
          if (typeof renderH === 'function') renderH();
          if (typeof route === 'function') route();
        } finally {
          applying = false;
        }
        setStatus('Updated from the cloud.', 'good');
      } else if ((local.updatedAt || 0) > (remote.updatedAt || 0)) {
        schedulePush();
      }
    } catch (e) {}
  }

  function wire() {
    const si = document.getElementById('sigo');
    const su = document.getElementById('suok');
    localSignIn = si ? si.onclick : null;
    if (si) si.onclick = signIn;
    if (su) su.onclick = signUp;
    Array.prototype.forEach.call(document.querySelectorAll('.gbtn'), b => { b.onclick = cloudGoogle; });

    const previousRender = window.renderP;
    if (typeof previousRender === 'function') {
      window.renderP = function () {
        previousRender();
        if (!cloudUid()) return;
        const rename = document.getElementById('mun');
        if (rename) rename.style.display = 'none';
        const sub = document.querySelector('#pb small');
        if (sub) sub.textContent = S.google ? 'Google account' : 'Cloud account';
      };
    }

    const previousOpen = window.openM;
    if (typeof previousOpen === 'function') {
      window.openM = function (which) {
        previousOpen(which);
        if (which === 'set') setTimeout(paint, 30);
        if (which === 'si') setTimeout(paintLocal, 30);
      };
    }

    window.logout = async function () {
      try { const fb = await loadSdk(); await fb.auth.signOut(); } catch (e) {}
      try { localStorage.removeItem('daSess'); } catch (e) {}
      location.reload();
    };

    window.cloudGoogle = cloudGoogle;

    const proto = window.Storage && Storage.prototype;
    if (proto && proto.setItem && !proto.__daCloud) {
      const original = proto.setItem;
      proto.setItem = function (key, value) {
        const result = original.call(this, key, value);
        try {
          if (!applying && !suppress && cloudUid() && key === stateKey()) schedulePush();
        } catch (e) {}
        return result;
      };
      proto.__daCloud = true;
    }
  }

  function boot() {
    inject();
    injectLocal();
    notes();
    paint();
    paintLocal();
    wire();
    if (cloudUid()) {
      if (typeof DA.onIdle === 'function') DA.onIdle(pull);
      else setTimeout(pull, 2000);
      return;
    }
    let redirect = false;
    try { redirect = localStorage.getItem(REDIRECT_FLAG) === '1'; } catch (e) {}
    if (!redirect) return;
    try { localStorage.removeItem(REDIRECT_FLAG); } catch (e) {}
    loadSdk()
      .then(fb => fb.auth.getRedirectResult())
      .then(result => { if (result && result.user) enter(result.user, { google: 1 }); })
      .catch(() => {});
  }

  window.addEventListener('online', () => { if (dirty) schedulePush(); });
  window.addEventListener('pagehide', () => { if (dirty) push(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && dirty) push();
  });

  boot();
})();
