let btn_saveAll = document.getElementById("btn_saveAllTabs");
let btn_addSelected = document.getElementById("btn_addSelectedTab");
let btn_openAll = document.getElementById("btn_openAllRememberTabs");
let btn_clear = document.getElementById("btn_clear");
let btn_edit = document.getElementById("btn_edit");
let pageCount = document.getElementById("pageCount");
let allTabsInfo = document.getElementById("allTabsInfo");
let privateString = ' (private)';
let isEditing = false;
let tabsInfo_list = [];

btn_edit.addEventListener("click", async () => {
    changeEditState();
});

btn_saveAll.addEventListener("click", async () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        let ul = document.createElement('ul');
        let tabsInfo = [];
        let count = 0;
        let incognito = false;
        allTabsInfo.innerHTML = '';
        tabsInfo_list = [];

        tabs.forEach(tab => {
            if (checkUrlValid(tab.url)) {
                let li = createElement_li(tab.title, tab.url);
                ul.appendChild(li);
                tabsInfo.push({ title: tab.title, url: tab.url });
                tabsInfo_list.push({ title: tab.title, url: tab.url });
                count += 1;

                if (tab.incognito == true) {
                    incognito = tab.incognito;
                }
            }
        });

        allTabsInfo.appendChild(ul);
        chrome.storage.local.set({ tabsInfo, incognito });
        pageCount.innerText = count;
        if (incognito == true) {
            pageCount.innerText += privateString;
        }
    });
});

btn_addSelected.addEventListener("click", async () => {
    chrome.storage.local.get(["tabsInfo", 'incognito'], ({ tabsInfo, incognito }) => {
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
                chrome.storage.local.set({ tabsInfo: newTabsInfo, incognito: incognito });
                pageCount.innerText = newTabsInfo.length;
                if (incognito == true) {
                    pageCount.innerText += privateString;
                }
            }
        });
    });
});

btn_openAll.addEventListener("click", async () => {
    chrome.storage.local.get(["tabsInfo", 'incognito'], ({ tabsInfo, incognito }) => {
        if (tabsInfo != undefined) {
            if (incognito == true) {
                // create private tab in same window.
                chrome.windows.create({ url: tabsInfo[0].url, incognito: true, setSelfAsOpener: true, state: 'maximized' }, (window) => {
                    for (let i = 1; i < tabsInfo.length; i++) {
                        chrome.tabs.create({ url: tabsInfo[i].url, windowId: window.id, active: false });
                    }
                });
            }
            else {
                tabsInfo.forEach((tab) => {
                    chrome.tabs.create({ url: tab.url, active: false });
                });
            }
        }
    });
});

btn_clear.addEventListener("click", async () => {
    changeEditState();
    tabsInfo_list = [];
    allTabsInfo.innerHTML = '';
    pageCount.innerText = 0;
    chrome.storage.local.clear();
});

chrome.storage.local.get(["tabsInfo", 'incognito'], ({ tabsInfo, incognito }) => {
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
        if (incognito == true) {
            pageCount.innerText += privateString;
        }
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

    let btn_del = document.createElement('button');
    btn_del.style.float = "right";
    btn_del.style.width = "30px";
    btn_del.style.height = "20px";
    btn_del.style.margin = "0";
    btn_del.style.background = "#FF3636";
    btn_del.style.borderRadius = "10px";
    btn_del.style.zIndex = "20";
    btn_del.style.position = "relative";
    if (isEditing == false) {
        btn_del.style.visibility = "hidden";
    }
    btn_del.className = 'btn_del';
    btn_del.addEventListener('click', async () => {
        deleteItem(url);
    });
    btn_del.innerText = "del";

    li.style.listStyle = 'none';
    li.style.background = `url("${iconUrl}") no-repeat transparent`;
    li.style.backgroundSize = `16px`;
    li.style.margin = '8px 0px';
    li.style.padding = '0px 0px 0px 24px';
    li.style.verticalAlign = 'middle';
    li.style.textOverflow = "ellipsis";
    li.style.overflow = "hidden";
    li.style.whiteSpace = "nowrap";
    li.appendChild(btn_del);
    li.appendChild(a);

    return li;
}

function deleteItem(url) {
    for (let i = 0; i < tabsInfo_list.length; i++) {
        if (tabsInfo_list[i].url == url) {
            tabsInfo_list.splice(i, 1);
            i--;
        }
    }
    allTabsInfo.innerHTML = '';
    chrome.storage.local.clear();

    let newTabsInfo = [];
    let ul = document.createElement('ul');

    tabsInfo_list.forEach(tab => {
        newTabsInfo.push({ title: tab.title, url: tab.url });
        let li = createElement_li(tab.title, tab.url);
        ul.appendChild(li);
    });

    allTabsInfo.innerHTML = '';
    allTabsInfo.appendChild(ul);
    if (pageCount.innerText.includes(privateString)) {
        chrome.storage.local.set({ tabsInfo: newTabsInfo, incognito: true });
    }
    else {
        chrome.storage.local.set({ tabsInfo: newTabsInfo, incognito: false });
    }
    pageCount.innerText = newTabsInfo.length;
    if (incognito == true) {
        pageCount.innerText += privateString;
    }
}

function changeEditState() {
    if (tabsInfo_list.length == 0) {
        return;
    }
    isEditing = !isEditing;
    if (isEditing) {
        btn_edit.innerText = "cancel";
        btn_clear.style.display = "block";
        btn_saveAll.style.display = "none";
        btn_openAll.style.display = "none";
        btn_addSelected.style.display = "none";
        var btns = document.getElementsByClassName('btn_del');
        if (btns != undefined && btns.length > 0) {
            for (let i = 0; i < btns.length; i++) {
                btns[i].style.visibility = "visible";
            }
        }
    }
    else {
        btn_edit.innerText = "edit";
        btn_clear.style.display = "none";
        btn_saveAll.style.display = "block";
        btn_openAll.style.display = "block";
        btn_addSelected.style.display = "block";
        var btns = document.getElementsByClassName('btn_del');
        if (btns != undefined && btns.length > 0) {
            for (let i = 0; i < btns.length; i++) {
                btns[i].style.visibility = "hidden";
            }
        }
    }
}