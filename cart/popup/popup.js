let getAllTabs = document.getElementById("getAllTabs");
let openAllRememberTabs = document.getElementById("openAllRememberTabs");
let clear = document.getElementById("clear");
let pageCount = document.getElementById("pageCount");
let allTabsInfo = document.getElementById("allTabsInfo");
let privateString = ' (private)';

getAllTabs.addEventListener("click", async () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        let ul = document.createElement('ul');
        let tabsInfo = [];
        let count = 0;
        let incognito = false;
        allTabsInfo.innerHTML = '';

        tabs.forEach(tab => {
            if (!tab.url.includes('edge://') && !tab.url.includes('chrome://')) {
                let li = createElement_li(tab.title, tab.url);
                ul.appendChild(li);
                tabsInfo.push({ title: tab.title, url: tab.url });
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

openAllRememberTabs.addEventListener("click", async () => {
    chrome.storage.local.get(["tabsInfo", 'incognito'], ({ tabsInfo, incognito }) => {
        if (tabsInfo != undefined) {
            if (incognito == true) {
                // create private tab in same window.
                chrome.windows.create({ url: tabsInfo[0].url, incognito: true, setSelfAsOpener: true }, (window) => {
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

clear.addEventListener("click", async () => {
    allTabsInfo.innerHTML = '';
    pageCount.innerText = 0;
    chrome.storage.local.clear();
});

chrome.storage.local.get(["tabsInfo", 'incognito'], ({ tabsInfo, incognito }) => {
    if (tabsInfo != undefined) {
        let ul = document.createElement('ul');
        tabsInfo.forEach(tab => {
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

    li.style.listStyle = 'none';
    li.style.background = `url("${iconUrl}") no-repeat transparent`;
    li.style.margin = '10px 0px';
    li.style.padding = '0px 0px 0px 24px';
    li.style.verticalAlign = 'middle';
    li.appendChild(a);

    return li;
}