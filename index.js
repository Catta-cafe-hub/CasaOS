// /public/extensions/casaos/index.js

const SERVER_URL = "https://st-cattacafe.casa/secret-casa";
const POLLING_RATE = 2000;

let casaState = { 
    isConnected: false, 
    isOpen: false,
    auth: { uid: null, token: null } 
};

// 1. รวม CSS ไว้ในนี้เลย เพื่อตัดปัญหาเรื่องไฟล์ style.css โหลดไม่ได้
const casaStyles = `
#casa-connect-btn {
    position: fixed; bottom: 80px; right: 20px;
    width: 50px; height: 50px; background: #222;
    border-radius: 12px; border: 2px solid #4CAF50;
    color: white; font-size: 24px; display: flex;
    justify-content: center; align-items: center;
    cursor: pointer; z-index: 9999;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}
#casa-phone-frame {
    position: fixed; bottom: 20px; right: 90px;
    width: 300px; height: 600px;
    background: #000; border-radius: 30px;
    border: 8px solid #333; z-index: 9999;
    display: none; overflow: hidden;
    font-family: sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
}
#casa-phone-frame.open { display: block; }
.casa-screen { width: 100%; height: 100%; background-size: cover; background-position: center; display: flex; flex-direction: column; }
.casa-status-bar { display: flex; justify-content: space-between; padding: 10px 20px; color: white; font-size: 12px; }
.casa-app-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; padding: 20px; }
.casa-app-icon { width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 24px; }
.casa-app-label { text-align: center; color: white; font-size: 10px; margin-top: 5px; }
`;

function createUI() {
    if (document.getElementById('casa-connect-btn')) return;

    // Inject CSS
    const styleSheet = document.createElement("style");
    styleSheet.innerText = casaStyles;
    document.head.appendChild(styleSheet);

    // Create Button
    const btn = document.createElement('div');
    btn.id = 'casa-connect-btn';
    btn.innerHTML = '📱';
    btn.onclick = togglePhone;
    document.body.appendChild(btn);

    // Create Phone
    const phone = document.createElement('div');
    phone.id = 'casa-phone-frame';
    phone.innerHTML = `
        <div class="casa-screen" id="casa-screen-bg">
            <div style="width:150px; height:25px; background:#333; margin:0 auto; border-bottom-left-radius:15px; border-bottom-right-radius:15px;"></div>
            <div class="casa-status-bar"><span id="casa-time-top">00:00</span><span>Cat 5G 📶</span></div>
            <div style="flex:1; padding:20px; color:white; text-align:center;">
                <div id="casa-clock-big" style="font-size:48px; margin-top:20px; text-shadow:2px 2px 5px black;">00:00</div>
                <div class="casa-app-grid" id="casa-grid"></div>
            </div>
            <div onclick="document.getElementById('casa-phone-frame').classList.remove('open')" style="width:100px; height:5px; background:white; margin:10px auto; border-radius:5px; cursor:pointer;"></div>
        </div>
    `;
    document.body.appendChild(phone);
}

function updateClock() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    
    // 🛡️ Safety Check: เช็คก่อนว่า Element มีจริงไหมก่อนจะใส่ค่า
    const topClock = document.getElementById('casa-time-top');
    const bigClock = document.getElementById('casa-clock-big');
    
    if (topClock) topClock.innerText = timeStr;
    if (bigClock) bigClock.innerText = timeStr;
}

async function togglePhone() {
    const phone = document.getElementById('casa-phone-frame');
    if (casaState.isOpen) {
        phone.classList.remove('open');
        casaState.isOpen = false;
    } else {
        const uid = localStorage.getItem('catta_uid');
        if (!uid) return alert("Please login CattaHub first!");
        
        phone.classList.add('open');
        casaState.isOpen = true;
        await loadProfile(uid);
    }
}

async function loadProfile(uid) {
    try {
        const res = await fetch(`${SERVER_URL}/v1/phone/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: uid })
        });
        const data = await res.json();
        if (data.success) {
            const bg = document.getElementById('casa-screen-bg');
            if (bg) bg.style.backgroundImage = `url('${data.profile.wallpaper}')`;
            renderApps();
        }
    } catch (e) { console.error("Casa Error:", e); }
}

function renderApps() {
    const grid = document.getElementById('casa-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const apps = [
        { n: 'CattaNet', i: '🌐' }, { n: 'Phone', i: '📞' },
        { n: 'Wallet', i: '👛' }, { n: 'Settings', i: '⚙️' }
    ];
    apps.forEach(app => {
        const div = document.createElement('div');
        div.innerHTML = `<div class="casa-app-icon">${app.i}</div><div class="casa-app-label">${app.n}</div>`;
        grid.appendChild(div);
    });
}

// เริ่มการทำงาน
jQuery(() => {
    createUI();
    setInterval(updateClock, 1000);
    console.log("📱 Casa OS Ready!");
});
