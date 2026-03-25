import { extension_settings } from "../../../extensions.js";

const SERVER_URL = "https://st-cattacafe.casa/secret-casa/";  
const POLLING_RATE = 2000;

let casaState = { isConnected: false, profile: null, isOpen: false };

async function init() {
    console.log("📱 CasaOS Extension Loaded");
    
    // สร้างปุ่ม
    const btn = document.createElement('div');
    btn.id = 'casa-connect-btn';
    btn.innerHTML = '📱';
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
                <div style="font-size:48px;text-align:center;text-shadow:2px 2px 5px black;" id="casa-clock-big">12:00</div>
                <div class="casa-app-grid" id="casa-grid"></div>
            </div>
            <div class="casa-home-bar" onclick="closeCasa()"></div>
        </div>
    `;
    document.body.appendChild(phone);

    // เริ่มเช็คสัญญาณ
    setInterval(checkToken, POLLING_RATE);
}

function checkToken() {
    const token = localStorage.getItem('catta_auth_token');
    const uid = localStorage.getItem('catta_uid');
    const btn = document.getElementById('casa-connect-btn');

    if (token && uid) {
        if (!casaState.isConnected) {
            btn.style.display = 'flex';
            btn.classList.add('connected');
            casaState.auth = { uid, token };
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
        phone.classList.remove('open');
        casaState.isOpen = false;
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
            body: JSON.stringify({ uid: casaState.auth.uid })
        });
        const data = await res.json();
        if (data.success) {
            renderHomeScreen(data.profile);
            return true;
        }
    } catch (e) {
        console.error("Casa Server Error:", e);
        toastr.error("Cannot connect to Casa Phone Server");
    }
    return false;
}

function renderHomeScreen(profile) {
    document.getElementById('casa-screen-bg').style.backgroundImage = `url('${profile.wallpaper}')`;
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
        div.innerHTML = `<div class="casa-app-icon">${app.icon}</div><div class="casa-app-label">${app.name}</div>`;
        grid.appendChild(div);
    });
}

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false});
    document.getElementById('casa-time').innerText = time;
    document.getElementById('casa-clock-big').innerText = time;
}

window.closeCasa = () => {
    document.getElementById('casa-phone-frame').classList.remove('open');
    casaState.isOpen = false;
};

// SillyTavern Entry Point
jQuery(async () => {
    init();
});
