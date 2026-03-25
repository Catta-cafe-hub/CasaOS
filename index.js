// /public/extensions/casa_v4/index.js
import { extension_settings } from "../../../extensions.js";

(function() {
    // --- 1. CONFIGURATION ---
    const SERVER_URL = "https://st-cattacafe.casa/secret-casa";
    const POLLING_RATE = 2000;
    
    // รายชื่อไอคอนที่คุณส่งมา (ครบ 9 ตัว)
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

    let casaState = { 
        isConnected: false, 
        profile: null, 
        isOpen: false, 
        auth: { uid: null, token: null } 
    };

    // --- 2. PREMIUM SMARTPHONE CSS ---
    const casaStyles = `
        /* ปุ่มเรียกโทรศัพท์ในแถบข้อความ */
        #casa-v4-btn { 
            display: none; /* ซ่อนไว้จนกว่าจะ Login */
            align-items: center; 
            justify-content: center;
            width: 34px; height: 34px; 
            background: rgba(255, 255, 255, 0.08); 
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 10px; 
            color: white; font-size: 18px; 
            cursor: pointer; 
            margin-right: 8px; 
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            flex-shrink: 0;
            align-self: center;
        }
        #casa-v4-btn:hover { background: #4CAF50; transform: scale(1.1); box-shadow: 0 0 10px rgba(76, 175, 80, 0.5); }
        #casa-v4-btn.connected { border-color: #4CAF50; }

        /* ตัวเครื่องโทรศัพท์ */
        #casa-v4-frame { 
            position: fixed; bottom: 85px; right: 20px; 
            width: 320px; height: 650px; 
            background: #000; border-radius: 45px; 
            border: 9px solid #282828; 
            z-index: 9999; display: none; 
            overflow: hidden; font-family: 'Segoe UI', sans-serif; 
            box-shadow: 0 25px 60px rgba(0,0,0,0.9); 
            transition: all 0.4s ease-in-out; 
            transform: translateY(30px); opacity: 0;
        }
        #casa-v4-frame.open { display: block; transform: translateY(0); opacity: 1; }

        .casa-screen { 
            width: 100%; height: 100%; 
            background-color: #1a1a1a; background-size: cover; 
            background-position: center; display: flex; flex-direction: column; 
            position: relative;
        }

        .casa-notch { 
            width: 150px; height: 26px; background: #282828; 
            margin: 0 auto; border-bottom-left-radius: 18px; border-bottom-right-radius: 18px;
            position: absolute; top: 0; left: 50%; transform: translateX(-50%); z-index: 10;
        }

        .casa-status-bar { 
            display: flex; justify-content: space-between; 
            padding: 35px 25px 5px; color: white; font-size: 12px; font-weight: 600; 
        }

        .casa-main-content { flex: 1; padding: 20px; display: flex; flex-direction: column; }

        .casa-clock-section { margin-top: 20px; text-align: center; color: white; }
        #casa-v4-big-time { font-size: 58px; font-weight: 200; text-shadow: 0 0 15px rgba(0,0,0,0.6); }
        #casa-v4-date { font-size: 14px; margin-top: -5px; opacity: 0.9; }

        .casa-wallet-pill {
            background: rgba(0,0,0,0.4); backdrop-filter: blur(10px);
            border-radius: 20px; padding: 5px 15px; margin: 15px auto;
            color: #FFD700; font-size: 12px; border: 1px solid rgba(255,255,255,0.1);
        }

        .casa-app-grid { 
            display: grid; grid-template-columns: repeat(3, 1fr); 
            gap: 18px; margin-top: 25px; width: 100%;
        }

        .casa-app-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
        .casa-app-item:active { transform: scale(0.9); }

        .casa-app-img { 
            width: 62px; height: 62px; border-radius: 16px; 
            background-size: cover; background-position: center; 
            box-shadow: 0 5px 12px rgba(0,0,0,0.4);
            border: 0.5px solid rgba(255,255,255,0.1);
        }

        .casa-app-name { 
            color: white; font-size: 11px; margin-top: 6px; 
            text-shadow: 1px 1px 3px rgba(0,0,0,0.8); font-weight: 500;
        }

        .casa-home-indicator { 
            width: 110px; height: 5px; background: rgba(255,255,255,0.7); 
            margin: 15px auto; border-radius: 10px; cursor: pointer; 
        }
    `;

    // --- 3. CORE FUNCTIONS ---

    function injectUI() {
        if (document.getElementById('casa-v4-btn')) return;

        const sendButton = document.getElementById('send_button');
        if (!sendButton) return;

        // Inject Styles
        const styleSheet = document.createElement("style");
        styleSheet.id = "casa-v4-styles";
        styleSheet.innerText = casaStyles;
        document.head.appendChild(styleSheet);

        // Create Button
        const btn = document.createElement('div');
        btn.id = 'casa-v4-btn'; 
        btn.innerHTML = '📱';
        btn.onclick = togglePhone;
        sendButton.parentNode.insertBefore(btn, sendButton);

        // Create Phone Frame
        const phone = document.createElement('div');
        phone.id = 'casa-v4-frame';
        phone.innerHTML = `
            <div class="casa-screen" id="casa-v4-screen">
                <div class="casa-notch"></div>
                <div class="casa-status-bar">
                    <span id="casa-v4-status-time">00:00</span>
                    <span>Cat 5G 📶</span>
                </div>
                <div class="casa-main-content">
                    <div class="casa-clock-section">
                        <div id="casa-v4-big-time">00:00</div>
                        <div id="casa-v4-date">Wednesday, 25 March</div>
                    </div>
                    <div class="casa-wallet-pill" id="casa-v4-wallet">💰 Loading Wallet...</div>
                    <div class="casa-app-grid" id="casa-v4-grid"></div>
                </div>
                <div class="casa-home-indicator" onclick="closeCasa()"></div>
            </div>
        `;
        document.body.appendChild(phone);
        console.log("✅ Casa OS: UI & Smartphone Injected");
    }

    function checkToken() {
        const uid = localStorage.getItem('catta_uid');
        const token = localStorage.getItem('catta_auth_token');
        const btn = document.getElementById('casa-v4-btn');

        if (uid && btn) {
            btn.style.display = 'inline-flex';
            casaState.auth = { uid, token };
            updateClock();
        } else if (btn) {
            btn.style.display = 'none';
        }
    }

    async function togglePhone() {
        const frame = document.getElementById('casa-v4-frame');
        if (!frame) return;

        if (casaState.isOpen) {
            closeCasa();
        } else {
            const success = await loadServerData();
            if (success) {
                frame.classList.add('open');
                casaState.isOpen = true;
            }
        }
    }

    async function loadServerData() {
        try {
            const res = await fetch(`${SERVER_URL}/v1/phone/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: casaState.auth.uid })
            });
            const data = await res.json();
            if (data.success) {
                renderContent(data);
                return true;
            }
        } catch (e) {
            console.error("Casa Server Error:", e);
            if (window.toastr) window.toastr.error("Casa Phone Server Offline");
        }
        return false;
    }

    function renderContent(data) {
        // Wallpaper
        const screen = document.getElementById('casa-v4-screen');
        if (screen && data.profile.wallpaper) {
            screen.style.backgroundImage = `url('${data.profile.wallpaper}')`;
        }

        // Wallet
        const walletEl = document.getElementById('casa-v4-wallet');
        if (walletEl) {
            walletEl.innerText = `💰 ${data.wallet.balance.toFixed(2)} THB | 🥕 ${data.wallet.carrots}`;
        }

        // Apps Grid
        const grid = document.getElementById('casa-v4-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const apps = [
            { name: 'Assistant', icon: ICON_URLS.assistant },
            { name: 'Phone', icon: ICON_URLS.phone },
            { name: 'Wallet', icon: ICON_URLS.wallet },
            { name: 'Camera', icon: ICON_URLS.camera },
            { name: 'App Store', icon: ICON_URLS.appstore },
            { name: 'Social', icon: ICON_URLS.social },
            { name: 'Gallery', icon: ICON_URLS.gallery },
            { name: 'Chat', icon: ICON_URLS.chat },
            { name: 'Settings', icon: ICON_URLS.settings }
        ];

        apps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'casa-app-item';
            item.onclick = () => alert(`Opening ${app.name}...`);
            item.innerHTML = `
                <div class="casa-app-img" style="background-image: url('${app.icon}')"></div>
                <div class="casa-app-name">${app.name}</div>
            `;
            grid.appendChild(item);
        });
    }

    function updateClock() {
        const now = new Date();
        const tStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        
        const sTime = document.getElementById('casa-v4-status-time');
        const bTime = document.getElementById('casa-v4-big-time');
        const dStr = document.getElementById('casa-v4-date');

        if (sTime) sTime.innerText = tStr;
        if (bTime) bTime.innerText = tStr;
        if (dStr) {
            const opt = { weekday: 'long', day: 'numeric', month: 'long' };
            dStr.innerText = now.toLocaleDateString('en-US', opt);
        }
    }

    function closeCasa() {
        const frame = document.getElementById('casa-v4-frame');
        if (frame) frame.classList.remove('open');
        casaState.isOpen = false;
    }

    // --- 4. INITIALIZATION & OBSERVER ---
    
    // ตั้งค่าตัวตรวจจับปุ่ม Send (MutationObserver)
    const observer = new MutationObserver(() => {
        if (document.getElementById('send_button') && !document.getElementById('casa-v4-btn')) {
            injectUI();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Polling สำหรับเช็คการ Login
    setInterval(checkToken, POLLING_RATE);

    // ป้องกัน Error updateScreen เก่า (ประกาศฟังก์ชันดักไว้)
    window.updateScreen = function() { console.log("Old Script Blocked"); };

    jQuery(() => {
        injectUI();
    });

    // ส่งออกฟังก์ชันปิดให้เรียกจากภายนอกได้
    window.closeCasa = closeCasa;

})();
