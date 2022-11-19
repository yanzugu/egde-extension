let btn_addAll = document.getElementById("btn_addAllTabs");
let btn_addCurrent = document.getElementById("btn_addCurrentTab");
let btn_openAll = document.getElementById("btn_openAllRememberTabs");
let btn_clear = document.getElementById("btn_clear");
let chb_incognito = document.getElementById("chb_incognito");
let pageCount = document.getElementById("pageCount");
let allTabsInfo = document.getElementById("allTabsInfo");
let tabsInfo_list = [];

chb_incognito.addEventListener('change', async (event) => {
    chrome.storage.local.set({ incognito: event.currentTarget.checked });

    if (event.currentTarget.checked) {
        allTabsInfo.style.backgroundSize = '100px';
    }
    else {
        allTabsInfo.style.backgroundSize = '0';
    }
});

btn_addAll.addEventListener("click", async () => {
    addAllTabs();
});

btn_addCurrent.addEventListener("click", async () => {
    addCurrentTab();
});

btn_openAll.addEventListener("click", async () => {
    openAll();
});

btn_clear.addEventListener("click", async () => {
    clearAllTabs();
});

chrome.storage.local.get(['tabsInfo', 'incognito'], ({ tabsInfo, incognito }) => {
    chb_incognito.checked = incognito;
    if (chb_incognito.checked) {
        allTabsInfo.style.backgroundSize = '100px';
    }
    else {
        allTabsInfo.style.backgroundSize = '0';
    }
    if (tabsInfo != undefined) {
        let ul = document.createElement('ul');
        tabsInfo_list = [];

        tabsInfo.forEach(tab => {
            tabsInfo_list.push({ title: tab.title, url: tab.url });
            let li = createElement_li(tab.title, tab.url);
            ul.appendChild(li);
        });
        allTabsInfo.appendChild(ul);
        pageCount.innerText = tabsInfo.length;
    }
});

function checkUrlValid(url) {
    if (url.includes('edge://') == true || url.includes('chrome://') == true) {
        return false;
    }

    for (let i = 0; i < tabsInfo_list.length; i++) {
        if (tabsInfo_list[i].url == url) {
            return false;
        }
    }

    return true;
}

function createElement_li(title, url) {
    let a = document.createElement('a');
    let li = document.createElement('li');
    let linkText = document.createTextNode(title);
    let iconUrl = 'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=' + url;

    a.title = url;
    a.target = '_blank';
    a.href = url;
    a.style.fontSize = '12px';
    a.style.color = 'white';
    a.appendChild(linkText);

    let btn_del = document.createElement('input');
    btn_del.type = 'image';
    btn_del.src = '/images/trash-can.png';
    btn_del.style.margin = "0 0 0 12px";
    btn_del.style.display = "none";
    btn_del.innerText = "del";
    btn_del.addEventListener('click', async () => {
        deleteItem(url);
    });

    let btn_edit = document.createElement('input');
    btn_edit.type = 'image';
    btn_edit.src = '/images/edit.png';
    btn_edit.style.margin = "0 0 0 10px";
    btn_edit.style.display = "none";
    btn_edit.innerText = "edit";
    btn_edit.addEventListener('click', async () => {
        //deleteItem(url);
    });

    let btn_open = document.createElement('input');
    btn_open.type = 'image';
    btn_open.src = '/images/popup1.png';
    btn_open.style.margin = "0 8px";
    btn_open.style.display = "none";
    btn_open.innerText = "edit";
    btn_open.addEventListener('click', async () => {
        openUrl(url);
    });

    li.style.background = `url("${iconUrl}") no-repeat transparent 2% center`;
    li.appendChild(btn_open);
    li.appendChild(btn_edit);
    li.appendChild(btn_del);
    li.appendChild(a);
    li.addEventListener('mouseover', async () => {
        btn_del.style.display = 'block';
        btn_edit.style.display = 'none';
        btn_open.style.display = 'block';
        li.style.background = `url("${iconUrl}") no-repeat rgba(48, 130, 256, 0.3) 2% center`;
    });
    li.addEventListener('mouseleave', async () => {
        btn_del.style.display = 'none';
        btn_edit.style.display = 'none';
        btn_open.style.display = 'none';
        li.style.background = `url("${iconUrl}") no-repeat transparent 2% center`;
    });

    return li;
}

function addAllTabs() {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        let ul = document.createElement('ul');
        let tabsInfo = [];
        let count = 0;
        allTabsInfo.innerHTML = '';

        tabsInfo_list.forEach((tab) => {
            let li = createElement_li(tab.title, tab.url);
            ul.appendChild(li);
            tabsInfo.push({ title: tab.title, url: tab.url });
            count += 1;
        });

        tabs.forEach(tab => {
            if (checkUrlValid(tab.url)) {
                let li = createElement_li(tab.title, tab.url);
                ul.appendChild(li);
                tabsInfo.push({ title: tab.title, url: tab.url });
                tabsInfo_list.push({ title: tab.title, url: tab.url });
                count += 1;
            }
        });

        allTabsInfo.appendChild(ul);
        chrome.storage.local.set({ tabsInfo });
        pageCount.innerText = count;
    });
}

function addCurrentTab() {
    chrome.storage.local.get(["tabsInfo"], ({ tabsInfo }) => {
        chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            let tab = tabs[0];

            if (tab != undefined && checkUrlValid(tab.url)) {
                let newTabsInfo = [];
                let ul = document.createElement('ul');
                tabsInfo_list = [];

                if (tabsInfo != undefined) {
                    tabsInfo.forEach(tab => {
                        newTabsInfo.push({ title: tab.title, url: tab.url });
                        tabsInfo_list.push({ title: tab.title, url: tab.url });
                        let li = createElement_li(tab.title, tab.url);
                        ul.appendChild(li);
                    });
                }

                newTabsInfo.push({ title: tab.title, url: tab.url });
                tabsInfo_list.push({ title: tab.title, url: tab.url });
                let li = createElement_li(tab.title, tab.url);
                ul.appendChild(li);

                allTabsInfo.innerHTML = '';
                allTabsInfo.appendChild(ul);
                chrome.storage.local.set({ tabsInfo: newTabsInfo });
                pageCount.innerText = newTabsInfo.length;
            }
        });
    });
}

function clearAllTabs() {
    tabsInfo_list = [];
    allTabsInfo.innerHTML = '';
    pageCount.innerText = 0;
    chrome.storage.local.clear();
}

function openAll() {
    chrome.storage.local.get(["tabsInfo"], ({ tabsInfo }) => {
        if (tabsInfo != undefined) {
            // create private tab in same window.
            chrome.windows.create({ url: tabsInfo[0].url, incognito: chb_incognito.checked, setSelfAsOpener: true, state: 'maximized' }, (window) => {
                if (window == null) {
                    alert('Please make sure Save My Tabs is allowed in incognito mode.');
                }
                else {
                    for (let i = 1; i < tabsInfo.length; i++) {
                        chrome.tabs.create({ url: tabsInfo[i].url, windowId: window.id, active: false });
                    }
                }
            });
        }
    });
}

function openUrl(url) {
    chrome.windows.create({ url: url, incognito: chb_incognito.checked, setSelfAsOpener: true, state: 'maximized' }, (window) => { });
}

function deleteItem(url) {
    for (let i = 0; i < tabsInfo_list.length; i++) {
        if (tabsInfo_list[i].url == url) {
            tabsInfo_list.splice(i, 1);
            i--;
        }
    }
    allTabsInfo.innerHTML = '';

    let newTabsInfo = [];
    let ul = document.createElement('ul');

    tabsInfo_list.forEach(tab => {
        newTabsInfo.push({ title: tab.title, url: tab.url });
        let li = createElement_li(tab.title, tab.url);
        ul.appendChild(li);
    });

    allTabsInfo.innerHTML = '';
    allTabsInfo.appendChild(ul);
    chrome.storage.local.set({ tabsInfo: newTabsInfo });
    pageCount.innerText = newTabsInfo.length;
}

function editItem(url) {
    for (let i = 0; i < tabsInfo_list.length; i++) {
        if (tabsInfo_list[i].url == url) {
            tabsInfo_list.splice(i, 1);
            i--;
        }
    }
    allTabsInfo.innerHTML = '';

    let newTabsInfo = [];
    let ul = document.createElement('ul');

    tabsInfo_list.forEach(tab => {
        newTabsInfo.push({ title: tab.title, url: tab.url });
        let li = createElement_li(tab.title, tab.url);
        ul.appendChild(li);
    });

    allTabsInfo.innerHTML = '';
    allTabsInfo.appendChild(ul);
    chrome.storage.local.set({ tabsInfo: newTabsInfo });
    pageCount.innerText = newTabsInfo.length;
}