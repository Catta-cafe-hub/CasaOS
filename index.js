// นำเข้าโมดูลที่จำเป็นจาก SillyTavern
import { extension_settings } from "../../../extensions.js";

const SERVER_URL = "https://st-cattacafe.casa/secret-casa"; // ตัด / ตัวสุดท้ายออกเพื่อกันพลาดตอนต่อ string
const POLLING_RATE = 2000;

let casaState = { 
    isConnected: false, 
    profile: null, 
    isOpen: false,
    auth: { uid: null, token: null } 
};

// ฟังก์ชันสร้าง UI
function createUI() {
    if (document.getElementById('casa-connect-btn')) return; // กันสร้างซ้ำ

    // สร้างปุ่ม
    const btn = document.createElement('div');
    btn.id = 'casa-connect-btn';
    btn.innerHTML = '📱';
    btn.style.display = 'none'; // ปิดไว้ก่อนจนกว่าจะเช็ค token เจอ
    btn.onclick = togglePhone;
    document.body.appendChild(btn);

    // สร้างโทรศัพท์
    const phone = document.createElement('div');
    phone.id = 'casa-phone-frame';
    phone.innerHTML = `
        <div class="casa-screen" id="casa-screen-bg">
            <div class="casa-notch"></div>
            <div class="casa-status-bar"><span id="casa-time">12:00</span><span>Cat 5G</span></div>
            <div class="casa-home-content">
                <div style="font-size:48px;text-align:center;text-shadow:2px 2px 5px black; color:white;" id="casa-clock-big">12:00</div>
                <div class="casa-app-grid" id="casa-grid"></div>
            </div>
            <div class="casa-home-bar" id="casa-close-trigger"></div>
        </div>
    `;
    document.body.appendChild(phone);

    // เพิ่ม Event Listener แทนการใช้ onclick ใน HTML string
    document.getElementById('casa-close-trigger').onclick = closeCasa;
}

function checkToken() {
    const token = localStorage.getItem('catta_auth_token');
    const uid = localStorage.getItem('catta_uid');
    const btn = document.getElementById('casa-connect-btn');

    if (!btn) return;

    if (token && uid) {
        casaState.auth = { uid, token };
        if (!casaState.isConnected) {
            btn.style.display = 'flex';
            btn.classList.add('connected');
            casaState.isConnected = true;
        }
        updateClock();
    } else {
        btn.style.display = 'none';
        casaState.isConnected = false;
    }
}

async function togglePhone() {
    const phone = document.getElementById('casa-phone-frame');
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
        // ตรวจสอบว่ามี toastr หรือยัง
        if (window.toastr) window.toastr.error("Cannot connect to Casa Phone Server");
    }
    return false;
}

function renderHomeScreen(profile) {
    const bg = document.getElementById('casa-screen-bg');
    if (profile && profile.wallpaper) {
        bg.style.backgroundImage = `url('${profile.wallpaper}')`;
    }
    
    const grid = document.getElementById('casa-grid');
    grid.innerHTML = '';
    
    const apps = [
        { name: 'CattaNet', icon: '🌐' },
        { name: 'Phone', icon: '📞' },
        { name: 'Wallet', icon: '👛' },
        { name: 'Settings', icon: '⚙️' }
    ];

    apps.forEach(app => {
        const div = document.createElement('div');
        div.className = 'casa-app-item'; // เพิ่ม class ให้จัดง่ายขึ้น
        div.innerHTML = `<div class="casa-app-icon">${app.icon}</div><div class="casa-app-label">${app.name}</div>`;
        grid.appendChild(div);
    });
}

function updateClock() {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
    const el1 = document.getElementById('casa-time');
    const el2 = document.getElementById('casa-clock-big');
    if (el1) el1.innerText = timeStr;
    if (el2) el2.innerText = timeStr;
}

function closeCasa() {
    const phone = document.getElementById('casa-phone-frame');
    if (phone) phone.classList.remove('open');
    casaState.isOpen = false;
}

// ส่วนเริ่มต้นการทำงานเมื่อ SillyTavern โหลดเสร็จ
jQuery(async () => {
    createUI();
    console.log("📱 CasaOS Extension Initialized");
    setInterval(checkToken, POLLING_RATE);
});
