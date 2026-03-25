// /public/extensions/casa_v3/index.js

(function() {
    const SERVER_URL = "https://st-cattacafe.casa/secret-casa";
    const POLLING_RATE = 2000;

    // ไอคอนที่คุณส่งมา
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

    const casaStyles = `
        #casa-v3-btn { position: fixed; bottom: 80px; right: 20px; width: 60px; height: 60px; background: #1a1a1a; border-radius: 18px; border: 2px solid #4CAF50; color: white; font-size: 28px; display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 9999; box-shadow: 0 4px 15px rgba(0,0,0,0.6); }
        #casa-v3-frame { position: fixed; bottom: 30px; right: 100px; width: 320px; height: 650px; background: #000; border-radius: 45px; border: 8px solid #333; z-index: 9999; display: none; overflow: hidden; font-family: sans-serif; box-shadow: 0 20px 50px rgba(0,0,0,0.9); transition: 0.3s; }
        .casa-screen { width: 100%; height: 100%; background-size: cover; background-position: center; display: flex; flex-direction: column; background-color: #222; }
        .casa-status { display: flex; justify-content: space-between; padding: 35px 25px 5px; color: white; font-size: 13px; font-weight: bold; }
        .casa-clock-area { text-align: center; color: white; margin-top: 30px; }
        .casa-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 25px; margin-top: 20px; }
        .casa-app { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
        .casa-app-img { width: 60px; height: 60px; border-radius: 15px; background-size: cover; background-position: center; box-shadow: 0 4px 8px rgba(0,0,0,0.5); }
        .casa-app-name { color: white; font-size: 11px; margin-top: 5px; text-shadow: 1px 1px 2px black; }
    `;

    function createUI() {
        if (document.getElementById('casa-v3-btn')) return;

        const styleSheet = document.createElement("style");
        styleSheet.innerText = casaStyles;
        document.head.appendChild(styleSheet);

        const btn = document.createElement('div');
        btn.id = 'casa-v3-btn'; btn.innerHTML = '📱';
        btn.onclick = togglePhone;
        document.body.appendChild(btn);

        const phone = document.createElement('div');
        phone.id = 'casa-v3-frame';
        phone.innerHTML = `
            <div class="casa-screen" id="casa-v3-bg">
                <div style="width:150px; height:25px; background:#222; margin:0 auto; border-bottom-left-radius:20px; border-bottom-right-radius:20px;"></div>
                <div class="casa-status"><span id="casa-v3-time">00:00</span><span>Cat 5G 📶</span></div>
                <div class="casa-clock-area">
                    <div id="casa-v3-big-clock" style="font-size:56px;">00:00</div>
                    <div style="font-size:14px; opacity:0.8;">CattaHub Connected</div>
                </div>
                <div class="casa-grid" id="casa-v3-grid"></div>
                <div onclick="document.getElementById('casa-v3-frame').style.display='none'" style="width:110px; height:5px; background:rgba(255,255,255,0.8); margin: auto auto 15px; border-radius:10px; cursor:pointer;"></div>
            </div>
        `;
        document.body.appendChild(phone);
        console.log("✅ Casa V3 UI Injected");
    }

    function updateTime() {
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        const t1 = document.getElementById('casa-v3-time');
        const t2 = document.getElementById('casa-v3-big-clock');
        if (t1) t1.innerText = timeStr;
        if (t2) t2.innerText = timeStr;
    }

    async function togglePhone() {
        const frame = document.getElementById('casa-v3-frame');
        if (frame.style.display === 'block') {
            frame.style.display = 'none';
        } else {
            const uid = localStorage.getItem('catta_uid');
            if (!uid) return alert("Please login CattaHub first!");
            frame.style.display = 'block';
            await loadData(uid);
        }
    }

    async function loadData(uid) {
        try {
            const res = await fetch(`${SERVER_URL}/v1/phone/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: uid })
            });
            const data = await res.json();
            if (data.success) {
                const bg = document.getElementById('casa-v3-bg');
                if (bg) bg.style.backgroundImage = `url('${data.profile.wallpaper}')`;
                renderApps();
            }
        } catch (e) { console.error("Casa Fetch Error:", e); }
    }

    function renderApps() {
        const grid = document.getElementById('casa-v3-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const apps = [
            { n: 'Assistant', i: ICON_URLS.assistant }, { n: 'Phone', i: ICON_URLS.phone },
            { n: 'Wallet', i: ICON_URLS.wallet }, { n: 'Camera', i: ICON_URLS.camera },
            { n: 'App Store', i: ICON_URLS.appstore }, { n: 'Social', i: ICON_URLS.social },
            { n: 'Gallery', i: ICON_URLS.gallery }, { n: 'Chat', i: ICON_URLS.chat },
            { n: 'Settings', i: ICON_URLS.settings }
        ];
        apps.forEach(app => {
            const div = document.createElement('div');
            div.className = 'casa-app';
            div.innerHTML = `<div class="casa-app-img" style="background-image:url('${app.i}')"></div><div class="casa-app-name">${app.n}</div>`;
            grid.appendChild(div);
        });
    }

    jQuery(() => {
        createUI();
        setInterval(updateTime, 1000);
    });
})();
