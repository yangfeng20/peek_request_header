// 一次请求一个request对象
let requestArr = []
let peekRequestHeaderListener = function (request) {
    if (requestArr.length >= 30) {
        requestArr = []
    }
    // 判断请求是否为 Ajax 异步请求,并过滤非ajax请求
    if (request.type !== "xmlhttprequest") {
        console.log("不是 Ajax 异步请求")
        return;
    }
    requestArr.push(request)
    chrome.storage.local.set({"requestArr": requestArr})
}


console.log("注册requestHeader监听器")
chrome.webRequest.onBeforeSendHeaders.addListener(
    peekRequestHeaderListener
    ,
    {urls: ["<all_urls>"]},
    // extraHeaders才能拿到cookie等敏感信息
    ["requestHeaders", "extraHeaders"]
);


// 获取所有已打开的页面
let views = chrome.extension.getViews({type: "popup"});

// 给所有 popup 注册关闭事件
for (let i = 0; i < views.length; i++) {
    let view = views[i];
    view.addEventListener("unload", function () {
        chrome.storage.local.set({"requestArr": {}})
    });
}
