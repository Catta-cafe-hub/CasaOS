// /public/extensions/casaos/index.js

const SERVER_URL = "https://st-cattacafe.casa/secret-casa"; 
const POLLING_RATE = 2000;

let casaState = { isConnected: false, profile: null, isOpen: false, auth: { uid: null, token: null } };

// รายชื่อไอคอนที่คุณส่งมา
const ICON_URLS = {
    cattaNet: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Robot_Assistant.png",
    phone: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Phone.png",
    wallet: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Wallet.png",
    camera: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/camera.png",
    appStore: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/App_Store.png",
    social: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Social_Media.png",
    gallery: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Gallery.png",
    chat: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Chat.png",
    settings: "https://file.garden/aaWjcAB_JUBaS4Ni/iconcasaos/Settings.png"
};

const casaStyles = `
    #casa-connect-btn {
        position: fixed; bottom: 80px; right: 20px;
        width: 60px; height: 60px; background: #1a1a1a;
        border-radius: 18px; border: 2px solid #4CAF50;
        color: white; font-size: 28px; display: flex;
        justify-content: center; align-items: center;
        cursor: pointer; z-index: 9999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.6);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    #casa-connect-btn:hover { transform: scale(1.1); }

    #casa-phone-frame {
        position: fixed; bottom: 30px; right: 100px;
        width: 320px; height: 650px;
        background: #000; border-radius: 45px;
        border: 10px solid #222; z-index: 9999;
        display: none; overflow: hidden;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 20px 50px rgba(0,0,0,0.9);
        transition: all 0.4s ease-in-out;
        transform: translateY(20px); opacity: 0;
    }
    #casa-phone-frame.open { display: block; transform: translateY(0); opacity: 1; }

    .casa-screen {
        width: 100%; height: 100%;
        background-color: #222; background-size: cover;
        background-position: center; display: flex; flex-direction: column;
        position: relative;
    }

    .casa-notch {
        width: 160px; height: 28px; background: #222;
        margin: 0 auto; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;
        position: absolute; top: 0; left: 50%; transform: translateX(-50%); z-index: 10;
    }

    .casa-status-bar {
        display: flex; justify-content: space-between;
        padding: 35px 25px 5px 25px; color: white; font-size: 13px;
        font-weight: 600; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
    }

    .casa-home-content { flex: 1; padding: 20px; display: flex; flex-direction: column; align-items: center; }

    .casa-clock-section { margin-top: 30px; text-align: center; color: white; }
    #casa-clock-big { font-size: 56px; font-weight: 200; text-shadow: 0 0 10px rgba(0,0,0,0.5); }
    .casa-date { font-size: 14px; margin-top: -5px; }

    .casa-app-grid {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 20px; margin-top: 50px; width: 100%;
    }

    .casa-app-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: 0.2s; }
    .casa-app-item:active { transform: scale(0.9); }

    .casa-app-icon {
        width: 60px; height: 60px; border-radius: 15px;
        background-size: cover; background-position: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }

    .casa-app-label {
        color: white; font-size: 11px; margin-top: 6px;
        text-shadow: 1px 1px 3px black; font-weight: 500;
    }

    .casa-home-bar {
        width: 110px; height: 5px; background: rgba(255,255,255,0.8);
        margin: 15px auto; border-radius: 10px; cursor: pointer;
    }
`;

async function init() {
    console.log("📱 CasaOS Smartphone UI Loaded");
    
    // Inject Styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = casaStyles;
    document.head.appendChild(styleSheet);

    // สร้างปุ่ม
    const btn = document.createElement('div');
    btn.id = 'casa-connect-btn';
    btn.innerHTML = '📱';
    btn.onclick = togglePhone;
    btn.style.display = 'none'; // ซ่อนไว้จนกว่าจะเช็ค token
    document.body.appendChild(btn);

    // สร้างโทรศัพท์
    const phone = document.createElement('div');
    phone.id = 'casa-phone-frame';
    phone.innerHTML = `
        <div class="casa-screen" id="casa-screen-bg">
            <div class="casa-notch"></div>
            <div class="casa-status-bar">
                <span id="casa-time">12:00</span>
                <span>Cat 5G 📶</span>
            </div>
            <div class="casa-home-content">
                <div class="casa-clock-section">
                    <div id="casa-clock-big">12:00</div>
                    <div class="casa-date" id="casa-date-str">Wednesday, 25 March</div>
                </div>
                <div class="casa-app-grid" id="casa-grid"></div>
            </div>
            <div class="casa-home-bar" onclick="closeCasa()"></div>
        </div>
    `;
    document.body.appendChild(phone);

    setInterval(checkToken, POLLING_RATE);
}

function checkToken() {
    const uid = localStorage.getItem('catta_uid');
    const btn = document.getElementById('casa-connect-btn');
    if (!btn) return;

    if (uid) {
        btn.style.display = 'flex';
        casaState.auth = { uid };
        updateClock();
    } else {
        btn.style.display = 'none';
        casaState.isConnected = false;
    }
}

async function togglePhone() {
    const phone = document.getElementById('casa-phone-frame');
    if (!phone) return;

    if (casaState.isOpen) {
        closeCasa();
    } else {
        const success = await connectToServer();
        if (success) {
            phone.classList.add('open');
            casaState.isOpen = true;
        }
    }
}

async function connectToServer() {
    try {
        const res = await fetch(`${SERVER_URL}/v1/phone/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: casaState.auth.uid })
        });
        const data = await res.json();
        if (data.success) {
            renderHomeScreen(data.profile);
            return true;
        }
    } catch (e) {
        console.error("Casa Server Error:", e);
        if (window.toastr) window.toastr.error("Cannot connect to Casa Phone Server");
    }
    return false;
}

function renderHomeScreen(profile) {
    const bg = document.getElementById('casa-screen-bg');
    if (bg && profile.wallpaper) bg.style.backgroundImage = `url('${profile.wallpaper}')`;
    
    const grid = document.getElementById('casa-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // ตั้งค่า Apps ตามไอคอนที่คุณส่งมา
    const apps = [
        { name: 'Assistant', icon: ICON_URLS.cattaNet },
        { name: 'Phone', icon: ICON_URLS.phone },
        { name: 'Wallet', icon: ICON_URLS.wallet },
        { name: 'Camera', icon: ICON_URLS.camera },
        { name: 'App Store', icon: ICON_URLS.appStore },
        { name: 'Social', icon: ICON_URLS.social },
        { name: 'Gallery', icon: ICON_URLS.gallery },
        { name: 'Chat', icon: ICON_URLS.chat },
        { name: 'Settings', icon: ICON_URLS.settings }
    ];

    apps.forEach(app => {
        const div = document.createElement('div');
        div.className = 'casa-app-item';
        div.onclick = () => alert(`Opening ${app.name}...`);
        div.innerHTML = `
            <div class="casa-app-icon" style="background-image: url('${app.icon}')"></div>
            <div class="casa-app-label">${app.name}</div>
        `;
        grid.appendChild(div);
    });
}

function updateClock() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    
    const timeEl = document.getElementById('casa-time');
    const clockEl = document.getElementById('casa-clock-big');
    const dateEl = document.getElementById('casa-date-str');

    if (timeEl) timeEl.innerText = timeStr;
    if (clockEl) clockEl.innerText = timeStr;
    if (dateEl) {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        dateEl.innerText = now.toLocaleDateString('en-US', options);
    }
}

window.closeCasa = () => {
    const phone = document.getElementById('casa-phone-frame');
    if (phone) phone.classList.remove('open');
    casaState.isOpen = false;
};

// SillyTavern Entry Point
jQuery(() => {
    init();
});
