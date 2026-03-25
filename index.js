// /public/extensions/casa-os-official/index.js

(function() {
    const EXT_ID = 'casa-os-official';
    const SERVER_URL = "https://st-cattacafe.casa/secret-casa";
    
    // 1. 🧹 ตรวจสอบและทำลายตัวเก่า (Self-Cleanup)
    // วิธีนี้จะทำให้ลูกค้าไม่ต้องกด Ctrl+F5 หรือล้างแคชบ่อยๆ เพราะโค้ดใหม่จะฆ่าตัวเก่าเอง
    if (window.casaCleanup) {
        console.log(`[${EXT_ID}] Cleaning up old version...`);
        window.casaCleanup();
    }

    const ICON_URLS = {
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

    let intervals = [];
    let casaObserver = null;

    // 2. 🛠 ฟังก์ชันสร้าง UI
    function setupUI() {
        // ลบ Element เก่าที่อาจค้างอยู่ (ป้องกันปุ่มซ้อน)
        const oldBtn = document.getElementById('casa-main-btn');
        const oldFrame = document.getElementById('casa-main-frame');
        if (oldBtn) oldBtn.remove();
        if (oldFrame) oldFrame.remove();

        const sendBtn = document.querySelector('#send_button');
        if (!sendBtn) return;

        // สไตล์โทรศัพท์
        const styleId = 'casa-core-styles';
        if (!document.getElementById(styleId)) {
            const s = document.createElement("style");
            s.id = styleId;
            s.innerText = `
                #casa-main-btn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 9px; color: white; font-size: 18px; cursor: pointer; margin-right: 8px; align-self: center; flex-shrink: 0; }
                #casa-main-frame { position: fixed; bottom: 85px; right: 20px; width: 320px; height: 650px; background: #000; border-radius: 45px; border: 8px solid #2a2a2a; z-index: 10001; display: none; overflow: hidden; font-family: sans-serif; box-shadow: 0 20px 60px rgba(0,0,0,0.9); }
                .casa-scr { width: 100%; height: 100%; background-size: cover; background-position: center; display: flex; flex-direction: column; background-color: #111; }
                .casa-top { display: flex; justify-content: space-between; padding: 35px 25px 5px; color: white; font-size: 12px; font-weight: bold; }
                .casa-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; padding: 25px; margin-top: 20px; }
                .casa-app { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
                .casa-app-img { width: 62px; height: 62px; border-radius: 16px; background-size: cover; background-position: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
                .casa-app-name { color: white; font-size: 11px; margin-top: 6px; text-shadow: 1px 1px 3px black; }
            `;
            document.head.appendChild(s);
        }

        const btn = document.createElement('div');
        btn.id = 'casa-main-btn'; btn.innerHTML = '📱';
        btn.onclick = togglePhone;
        sendBtn.parentNode.insertBefore(btn, sendBtn);

        const frame = document.createElement('div');
        frame.id = 'casa-main-frame';
        frame.innerHTML = `
            <div class="casa-scr" id="casa-bg-layer">
                <div style="width:150px; height:26px; background:#2a2a2a; margin:0 auto; border-bottom-left-radius:20px; border-bottom-right-radius:20px;"></div>
                <div class="casa-top"><span id="casa-t-mini">00:00</span><span>Cat 5G 📶</span></div>
                <div style="text-align:center; color:white; margin-top:30px;">
                    <div id="casa-t-big" style="font-size:56px; font-weight:200;">00:00</div>
                    <div id="casa-wallet-val" style="font-size:12px; background:rgba(0,0,0,0.4); border-radius:15px; padding:4px 12px; display:inline-block; margin-top:5px; color:#FFD700;">💰 Loading...</div>
                </div>
                <div class="casa-grid" id="casa-app-grid"></div>
                <div onclick="document.getElementById('casa-main-frame').style.display='none'" style="width:110px; height:5px; background:rgba(255,255,255,0.7); margin: auto auto 15px; border-radius:10px; cursor:pointer;"></div>
            </div>
        `;
        document.body.appendChild(frame);
    }

    async function togglePhone() {
        const f = document.getElementById('casa-main-frame');
        if (f.style.display === 'block') {
            f.style.display = 'none';
        } else {
            const uid = localStorage.getItem('catta_uid');
            if (!uid) return alert("Please Login CattaHub!");
            f.style.display = 'block';
            loadData(uid);
        }
    }

    async function loadData(uid) {
        try {
            const res = await fetch(`${SERVER_URL}/v1/phone/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: uid })
            });
            const d = await res.json();
            if (d.success) {
                document.getElementById('casa-bg-layer').style.backgroundImage = `url('${d.profile.wallpaper}')`;
                document.getElementById('casa-wallet-val').innerText = `💰 ${d.wallet.balance.toFixed(2)} | 🥕 ${d.wallet.carrots}`;
                const grid = document.getElementById('casa-app-grid');
                grid.innerHTML = '';
                const apps = [
                    {n:'Assistant', i:ICON_URLS.assistant}, {n:'Phone', i:ICON_URLS.phone},
                    {n:'Wallet', i:ICON_URLS.wallet}, {n:'Camera', i:ICON_URLS.camera},
                    {n:'App Store', i:ICON_URLS.appstore}, {n:'Social', i:ICON_URLS.social},
                    {n:'Gallery', i:ICON_URLS.gallery}, {n:'Chat', i:ICON_URLS.chat},
                    {n:'Settings', i:ICON_URLS.settings}
                ];
                apps.forEach(a => {
                    const div = document.createElement('div');
                    div.className = 'casa-app';
                    div.innerHTML = `<div class="casa-app-img" style="background-image:url('${a.i}')"></div><div class="casa-app-name">${a.n}</div>`;
                    grid.appendChild(div);
                });
            }
        } catch (e) { console.error(e); }
    }

    // 3. 🕒 ฟังก์ชันนาฬิกา
    function tick() {
        const now = new Date();
        const s = now.getHours().toString().padStart(2,'0')+":"+now.getMinutes().toString().padStart(2,'0');
        const m = document.getElementById('casa-t-mini');
        const b = document.getElementById('casa-t-big');
        if (m) m.innerText = s; if (b) b.innerText = s;
    }

    // 4. 🧹 ฟังก์ชันสำหรับฆ่าตัวเองเมื่อมีการอัปเดต (Cleanup Mechanism)
    window.casaCleanup = function() {
        intervals.forEach(clearInterval);
        if (casaObserver) casaObserver.disconnect();
        const btn = document.getElementById('casa-main-btn');
        const frame = document.getElementById('casa-main-frame');
        if (btn) btn.remove();
        if (frame) frame.remove();
        console.log(`[${EXT_ID}] Cleanup complete.`);
    };

    // 5. 🚀 เริ่มการทำงาน
    intervals.push(setInterval(tick, 1000));
    
    casaObserver = new MutationObserver(() => {
        if (document.querySelector('#send_button') && !document.getElementById('casa-main-btn')) {
            setupUI();
        }
    });
    casaObserver.observe(document.body, { childList: true, subtree: true });

    // ประกาศฟังก์ชันหลอกๆ ไว้ดัก Error จากสคริปต์เก่าที่ลูกค้าอาจจะเคยรันไว้
    window.updateScreen = function() { return null; };
})();
