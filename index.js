// /public/extensions/casa_ultra/index.js

(function() {
    const SERVER_URL = "https://st-cattacafe.casa/secret-casa";
    const ID_PREFIX = "casa_v5_" + Math.floor(Math.random() * 1000); // สุ่ม ID ทุกครั้งที่โหลดเพื่อหนี Cache

    const ICONS = {
        assistant: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Robot_Assistant.png",
        phone: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Phone.png",
        wallet: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Wallet.png",
        camera: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/camera.png",
        appstore: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/App_Store.png",
        social: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Social_Media.png",
        gallery: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Gallery.png",
        chat: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Chat.png",
        settings: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Settings.png"
    };

    const styles = `
        #casa-v5-btn { 
            display: inline-flex; align-items: center; justify-content: center;
            width: 34px; height: 34px; background: rgba(255,255,255,0.1); 
            border: 1px solid rgba(255,255,255,0.2); border-radius: 9px; 
            color: white; font-size: 18px; cursor: pointer; 
            margin-right: 8px; transition: 0.2s; align-self: center; flex-shrink: 0;
        }
        #casa-v5-btn:hover { background: #4CAF50; transform: scale(1.1); }
        #casa-v5-frame { 
            position: fixed; bottom: 85px; right: 20px; 
            width: 320px; height: 650px; background: #000; 
            border-radius: 45px; border: 8px solid #2a2a2a; 
            z-index: 10001; display: none; overflow: hidden; 
            font-family: sans-serif; box-shadow: 0 20px 60px rgba(0,0,0,0.9);
        }
        .v5-screen { width: 100%; height: 100%; background-size: cover; background-position: center; display: flex; flex-direction: column; background-color: #111; }
        .v5-status { display: flex; justify-content: space-between; padding: 35px 25px 5px; color: white; font-size: 12px; font-weight: bold; }
        .v5-clock-area { text-align: center; color: white; margin-top: 30px; }
        .v5-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; padding: 25px; margin-top: 20px; }
        .v5-app { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
        .v5-app-img { width: 62px; height: 62px; border-radius: 16px; background-size: cover; background-position: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .v5-app-name { color: white; font-size: 11px; margin-top: 6px; text-shadow: 1px 1px 3px black; }
    `;

    function buildUI() {
        if (document.getElementById('casa-v5-btn')) return;

        const sendButton = document.querySelector('#send_button');
        if (!sendButton) return;

        const styleTag = document.createElement("style");
        styleTag.innerText = styles;
        document.head.appendChild(styleTag);

        const btn = document.createElement('div');
        btn.id = 'casa-v5-btn'; btn.innerHTML = '📱';
        btn.onclick = () => {
            const f = document.getElementById('casa-v5-frame');
            if (f.style.display === 'block') f.style.display = 'none';
            else {
                const uid = localStorage.getItem('catta_uid');
                if (!uid) return alert("Please Login CattaHub!");
                f.style.display = 'block';
                fetchData(uid);
            }
        };
        sendButton.parentNode.insertBefore(btn, sendButton);

        const phone = document.createElement('div');
        phone.id = 'casa-v5-frame';
        phone.innerHTML = `
            <div class="v5-screen" id="v5-bg">
                <div style="width:150px; height:26px; background:#2a2a2a; margin:0 auto; border-bottom-left-radius:20px; border-bottom-right-radius:20px;"></div>
                <div class="v5-status"><span id="v5-time-mini">00:00</span><span>Cat 5G 📶</span></div>
                <div class="v5-clock-area">
                    <div id="v5-time-big" style="font-size:56px; font-weight:200;">00:00</div>
                    <div id="v5-wallet" style="font-size:12px; background:rgba(0,0,0,0.4); border-radius:15px; padding:4px 12px; display:inline-block; margin-top:5px; color:#FFD700;">💰 Loading...</div>
                </div>
                <div class="v5-grid" id="v5-grid-apps"></div>
                <div onclick="document.getElementById('casa-v5-frame').style.display='none'" style="width:110px; height:5px; background:rgba(255,255,255,0.7); margin: auto auto 15px; border-radius:10px; cursor:pointer;"></div>
            </div>
        `;
        document.body.appendChild(phone);
        console.log("⭐⭐⭐ CASA V5 LOADED SUCCESSFULLY ⭐⭐⭐");
    }

    async function fetchData(uid) {
        try {
            const r = await fetch(`${SERVER_URL}/v1/phone/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: uid })
            });
            const d = await r.json();
            if (d.success) {
                document.getElementById('v5-bg').style.backgroundImage = `url('${d.profile.wallpaper}')`;
                document.getElementById('v5-wallet').innerText = `💰 ${d.wallet.balance.toFixed(2)} | 🥕 ${d.wallet.carrots}`;
                const grid = document.getElementById('v5-grid-apps');
                grid.innerHTML = '';
                const apps = [
                    {n:'Assistant', i:ICONS.assistant}, {n:'Phone', i:ICONS.phone},
                    {n:'Wallet', i:ICONS.wallet}, {n:'Camera', i:ICONS.camera},
                    {n:'App Store', i:ICONS.appstore}, {n:'Social', i:ICONS.social},
                    {n:'Gallery', i:ICONS.gallery}, {n:'Chat', i:ICONS.chat},
                    {n:'Settings', i:ICONS.settings}
                ];
                apps.forEach(a => {
                    const div = document.createElement('div');
                    div.className = 'v5-app';
                    div.innerHTML = `<div class="v5-app-img" style="background-image:url('${a.i}')"></div><div class="v5-app-name">${a.n}</div>`;
                    grid.appendChild(div);
                });
            }
        } catch (e) { console.error(e); }
    }

    function tick() {
        const now = new Date();
        const s = now.getHours().toString().padStart(2,'0')+":"+now.getMinutes().toString().padStart(2,'0');
        const m = document.getElementById('v5-time-mini');
        const b = document.getElementById('v5-time-big');
        if (m) m.innerText = s; if (b) b.innerText = s;
    }

    const obs = new MutationObserver(() => {
        if (document.querySelector('#send_button')) buildUI();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    setInterval(tick, 1000);
})();
