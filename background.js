// 一次请求一个header对象
let requestArr = []
let peekRequestHeaderListener = function (request) {
    if (requestArr.length >= 20) {
        requestArr = []
    }
    requestArr.push(request)
    chrome.storage.local.set({"requestArr": requestArr})
}


console.log("注册requestHeader监听器")
chrome.webRequest.onBeforeSendHeaders.addListener(
    peekRequestHeaderListener
    ,
    {urls: ["<all_urls>"]},
    ["requestHeaders"]
);
