const status_closed = 'Closed';
const status_opened = 'Opened';
const status_failed = 'Failed';
const status_openning = 'Openning...';

const container = document.getElementById('container');
const clientTemplate = document.getElementById('clientTemplate');
const themeSwitchToggle = document.getElementById('themeSwitchToggle');
const layoutBtnsContainer = document.getElementById('layoutBtnsContainer');

let templateCount = 0;
let templateInfos = [];

function createTemplate() {
    // template fragment
    const clone = document.importNode(clientTemplate.content, true);
    const templateContainer = clone.querySelector('#template-container');
    const connectBtn = clone.querySelector('#connectBtn');
    const closeBtn = clone.querySelector('#closeBtn');
    const sendBtn = clone.querySelector('#sendBtn');
    const clearBtn = clone.querySelector('#clearBtn');
    const urlInput = clone.querySelector('#serverUrl');
    const msgArea = clone.querySelector('#msgArea');
    const logList = clone.querySelector('#logList');
    const connectStatus = clone.querySelector('#connectStatus');
    const sendMsgCheckbox = clone.querySelector('#sendMsgCheckbox');
    const receiveMsgCheckbox = clone.querySelector('#receiveMsgCheckbox');
    const infoMsgCheckbox = clone.querySelector('#infoMsgCheckbox');

    const templateInfo = {
        content: templateContainer,
        ws: null
    }
    let isOpen = false;

    templateCount++;
    templateContainer.id += `-${templateCount}`;
    connectBtn.id += `-${templateCount}`;
    closeBtn.id += `-${templateCount}`;
    sendBtn.id += `-${templateCount}`;
    clearBtn.id += `-${templateCount}`;
    urlInput.id += `-${templateCount}`;
    msgArea.id += `-${templateCount}`;
    logList.id += `-${templateCount}`;
    connectStatus.id += `-${templateCount}`;
    sendMsgCheckbox.id += `-${templateCount}`;
    receiveMsgCheckbox.id += `-${templateCount}`;
    infoMsgCheckbox.id += `-${templateCount}`;

    connectBtn.onclick = connect;
    closeBtn.onclick = disconnect;
    sendBtn.onclick = sendMessage;
    clearBtn.onclick = () => { logList.innerHTML = '' }
    sendMsgCheckbox.onclick = () => {
        //ws://127.0.0.1:8000/chat
        let sendList = logList.getElementsByClassName('send-msg-item');
        for (let i = 0; i < sendList.length; i++) {
            sendList[i].hidden = !sendMsgCheckbox.checked;
        }
    }
    receiveMsgCheckbox.onclick = () => {
        let receiveList = logList.getElementsByClassName('receive-msg-item');
        for (let i = 0; i < receiveList.length; i++) {
            receiveList[i].hidden = !receiveMsgCheckbox.checked;
        }
    }
    infoMsgCheckbox.onclick = () => {
        let infoList = logList.querySelectorAll('.info,.warn');
        for (let i = 0; i < infoList.length; i++) {
            infoList[i].hidden = !infoMsgCheckbox.checked;
        }
    }
    msgArea.onkeydown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            sendMessage();
        }
    }

    function updateUIStatus(isOpen) {
        sendBtn.disabled = !isOpen;
        msgArea.disabled = !isOpen;
        urlInput.disabled = isOpen;
        connectBtn.hidden = isOpen;
        closeBtn.hidden = !isOpen;
    }

    function connect() {
        let url = urlInput.value.trim();
        if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
            alert('WebSocket url must starts with "ws://" or "wss://".');
            return;
        }
        if (url === 'ws://' || url === 'wss://') {
            alert('Please enter url.');
            return;
        }

        connectStatus.className = '';
        connectStatus.innerHTML = status_openning;
        connectBtn.disabled = true;
        closeBtn.disabled = true;
        logInfo(`connecting to "${url}"`)

        templateInfo.ws = new WebSocket(url);

        templateInfo.ws.onopen = () => {
            isOpen = true;
            logInfo('connection success')
            updateUIStatus(true);
            connectStatus.classList.add('info')
            connectStatus.innerHTML = status_opened;
            connectBtn.disabled = false;
            closeBtn.disabled = false;
        }

        templateInfo.ws.onclose = () => {
            console.log('close')
            connectStatus.className = '';

            if (isOpen) {
                logInfo('connection close')
                connectStatus.innerHTML = status_closed;
            } else {
                logWarn('connection failed')
                connectStatus.innerHTML = status_failed;
                connectStatus.classList.add('warn')
            }

            isOpen = false;
            updateUIStatus(false);
            connectBtn.disabled = false;
            closeBtn.disabled = false;
        }

        templateInfo.ws.onmessage = (e) => {
            logReceive(e.data)
        }

        templateInfo.ws.onerror = (e) => {
            console.log(e);
        }
    }

    function disconnect() {
        if (templateInfo.ws != null) {
            templateInfo.ws.close();
        }
    }

    function sendMessage() {
        if (templateInfo.ws != null && templateInfo.ws.readyState == WebSocket.OPEN) {
            templateInfo.ws.send(msgArea.value);
            logSend(msgArea.value)
        }
    }

    function logInfo(text) {
        let div = document.createElement('div');
        div.innerText = `- ${text}`;
        div.classList.add('msg-item');
        div.classList.add('info');
        div.hidden = !infoMsgCheckbox.checked;
        logList.appendChild(div);
    }

    function logWarn(text) {
        let div = document.createElement('div');
        div.innerText = `- ${text}`;
        div.classList.add('msg-item');
        div.classList.add('warn');
        div.hidden = !infoMsgCheckbox.checked;
        logList.appendChild(div);
    }

    function logSend(text) {
        let div = document.createElement('div');
        div.innerText = text;
        div.classList.add('msg-item');
        div.classList.add('send-msg-item');
        div.hidden = !sendMsgCheckbox.checked;
        logList.appendChild(div);
    }

    function logReceive(text) {
        let div = document.createElement('div');
        div.innerText = text;
        div.classList.add('msg-item');
        div.classList.add('receive-msg-item');
        div.hidden = !receiveMsgCheckbox.checked;
        logList.appendChild(div);
    }

    return templateInfo;
}

function setLayout(count) {
    while (templateInfos.length < count) {
        let t = createTemplate();
        templateInfos.push(t);
    }
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        container.appendChild(templateInfos[i].content);
    }
}

function changeTheme() {
    if (themeSwitchToggle.checked) {
        document.body.classList.add('darkTheme');
    } else {
        document.body.classList.remove('darkTheme');
    }
}

themeSwitchToggle.onclick = changeTheme;

for (let i = 1; i <= 4; i++) {
    const btn = document.createElement('button');
    btn.classList.add('m-4');
    btn.innerText = i;
    btn.onclick = () => setLayout(i);
    layoutBtnsContainer.appendChild(btn);
}

changeTheme();
setLayout(1);