const {ipcRenderer} = require('electron');

function startClock() {

    const W = 150;
    const H = 150;
    const CW = W / 2 + 0.5;
    const CH = H / 2 + 0.5;
    const R = 50;
    const R_RULE_IN = 45;
    const R_RULE_OUT = 50;
    const RINDICES = 60;
    const RHOURS = 32;
    const RMINUTES = 40;
    const RSECONDS = 40;
    const FRAME_COLOR = '#fff';
 
    const canvas = window.document.getElementById('c');
    const ctx = canvas.getContext('2d');
    
    let staticData = null;
    let isDrag = false;
    const startPos = {
        x: null,
        y: null
    };
 
    function addCanvasListeners() {
        canvas.addEventListener('mousedown', (e) => {
            isDrag = true;
            startPos.x = e.clientX;
            startPos.y = e.clientY;
        });
        canvas.addEventListener('mouseup', () => {
            isDrag = false;
        });
        canvas.addEventListener('mousemove', (e) => {
            const delta = {
                x: e.clientX - startPos.x,
                y: e.clientY - startPos.y
            };
            if (isDrag) {
                ipcRenderer.send('moveDelta', delta);
            }
        });
    }

    function clear() {
        ctx.clearRect(0, 0, W, H);
    }
 
    function getCircumferencePoint(ratio, radius) {
        const theta = Math.PI * 2 * ratio;
        return {
            x: CW + radius * Math.sin(theta),
            y: CH - radius * Math.cos(theta)
        };
    }
 
    function init() {
        canvas.width = W;
        canvas.height = H;
        renderFrame();
        // renderIndices();
        renderRules();
        staticData = ctx.getImageData(0, 0, W, H);
        addCanvasListeners();
        tick();
    }
 
    function renderBg() {
        ctx.putImageData(staticData, 0, 0);
    }

    function renderCenterPoint() {
        ctx.beginPath();
        ctx.arc(CW, CH, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
 
    function renderFrame() {
        ctx.save();
        ctx.lineWidth = 4;
        ctx.fillStyle = FRAME_COLOR;
        ctx.beginPath();
        ctx.arc(CW, CH, R, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }
 
    function renderIndices() {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = '10px arial bold';
        for (let i = 1; i < 13; i++) {
            const p = getCircumferencePoint( i / 12, RINDICES);
            const measure = ctx.measureText(i);
            const halfWidth =  measure.width / 2;
            ctx.fillText(i, p.x - halfWidth, p.y + halfWidth);
        }
        ctx.restore();
    }
 
    function renderHourHand(hour) {
        const p = getCircumferencePoint(hour / 12, RHOURS);
        ctx.save();
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(CW, CH);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
    }
 
    function renderMinuteHand(minute) {
        const p = getCircumferencePoint(minute / 60, RMINUTES);
        ctx.save();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(CW, CH);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
    }
 
    function renderRules() {
        ctx.save();
        for (let i = 1; i < 61; i++) {
            const pIn = getCircumferencePoint( i / 60, R_RULE_IN);
            const pOut = getCircumferencePoint( i / 60, R_RULE_OUT);
            if (i % 5) {
                ctx.lineWidth = 1;
            } else {
                ctx.lineWidth = 2;
            }
            ctx.beginPath();
            ctx.moveTo(pIn.x, pIn.y);
            ctx.lineTo(pOut.x, pOut.y);
            ctx.stroke();
        }
        ctx.restore();
    }
 
    function renderSecondHand(second) {
        const p = getCircumferencePoint(second / 60, RSECONDS);
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(CW, CH);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
    }
 
    function tick() {
        const d = new Date();
        const msec = d.getMilliseconds();
        const second = d.getSeconds() + (msec / 1000);
        const minute = d.getMinutes() + (second / 60);
        const hour = d.getHours() + (minute / 60);
        // clear();
        renderBg();
        renderHourHand(hour);
        renderMinuteHand(minute);
        renderSecondHand(second);
        renderCenterPoint();
        // requestAnimationFrame(tick);
    }
 
    init();
 
    // tick();
    setInterval(tick, 1000);
 }
 
 startClock();
 