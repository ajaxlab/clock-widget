const { ipcRenderer } = require('electron');

function startClock() {

    const W = 108;
    const H = 108;
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

    let canvasSizeRatio = 1;
    let staticData = null;
    let isDrag = false;
    const startPos = {
        x: null,
        y: null
    };

    function addCanvasListeners() {
        function sendMoveEnd() {
            isDrag = false;
            setCanvasRatio(1);
            tick();
            ipcRenderer.send('moveEnd');
        }
        canvas.addEventListener('mousedown', (e) => {
            const bounds0 = getCanvasBounds();
            setCanvasRatio(8);
            const bounds = getCanvasBounds();
            tick();
            ipcRenderer.send('moveStart');
            isDrag = true;
            startPos.x = e.clientX + (bounds.width - bounds0.width) / 2;
            startPos.y = e.clientY + (bounds.height - bounds0.height) / 2;
        });
        canvas.addEventListener('mouseup', () => {
            sendMoveEnd();
        });
        canvas.addEventListener('mousemove', (e) => {
            const delta = {
                x: e.clientX - startPos.x,
                y: e.clientY - startPos.y
            };
            if (isDrag) {
                ipcRenderer.send('move', delta);
            }
        });
        canvas.addEventListener('mouseleave', (e) => {
            if (isDrag) {
                sendMoveEnd();
            }
        });
    }

    function clear() {
        const bounds = getCanvasBounds();
        ctx.clearRect(0, 0, bounds.width, bounds.height);
    }

    function getCanvasBounds() {
        const height = H * canvasSizeRatio;
        const width = W * canvasSizeRatio;
        return {
            height,
            width,
            centerH: height / 2 + 0.5,
            centerW: width / 2 + 0.5
        };
    }

    function getCircumferencePoint(ratio, radius) {
        const theta = Math.PI * 2 * ratio;
        const bounds = getCanvasBounds();
        return {
            x: bounds.centerW + radius * Math.sin(theta),
            y: bounds.centerH - radius * Math.cos(theta)
        };
    }

    function init() {
        setCanvasRatio(1);
        addCanvasListeners();
        tick();
    }

    function renderBg() {
        ctx.putImageData(staticData, 0, 0);
    }

    function renderCenterPoint() {
        const { centerW, centerH } = getCanvasBounds();
        ctx.beginPath();
        ctx.arc(centerW, centerH, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    function renderFrame() {
        const { centerW, centerH } = getCanvasBounds();
        ctx.save();
        ctx.lineWidth = 4;
        ctx.fillStyle = FRAME_COLOR;
        ctx.beginPath();
        ctx.arc(centerW, centerH, R, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    function renderIndices() {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = '10px arial bold';
        for (let i = 1; i < 13; i++) {
            const p = getCircumferencePoint(i / 12, RINDICES);
            const measure = ctx.measureText(i);
            const halfWidth = measure.width / 2;
            ctx.fillText(i, p.x - halfWidth, p.y + halfWidth);
        }
        ctx.restore();
    }

    function renderHourHand(hour) {
        const { centerW, centerH } = getCanvasBounds();
        const p = getCircumferencePoint(hour / 12, RHOURS);
        ctx.save();
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(centerW, centerH);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
    }

    function renderMinuteHand(minute) {
        const { centerW, centerH } = getCanvasBounds();
        const p = getCircumferencePoint(minute / 60, RMINUTES);
        ctx.save();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(centerW, centerH);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
    }

    function renderRules() {
        ctx.save();
        for (let i = 1; i < 61; i++) {
            const pIn = getCircumferencePoint(i / 60, R_RULE_IN);
            const pOut = getCircumferencePoint(i / 60, R_RULE_OUT);
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
        const { centerW, centerH } = getCanvasBounds();
        const p = getCircumferencePoint(second / 60, RSECONDS);
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(centerW, centerH);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
    }

    function setCanvasRatio(ratio) {
        canvasSizeRatio = ratio || 1;
        const { width, height } = getCanvasBounds();
        canvas.width = width;
        canvas.height = height;
        updateCache();
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

    function updateCache() {
        renderFrame();
        // renderIndices();
        renderRules();
        const { width, height } = getCanvasBounds();
        staticData = ctx.getImageData(0, 0, width, height);
    }

    init();

    // tick();
    setInterval(tick, 1000);
}

startClock();
