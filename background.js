let requestArr = []
let onlyCatchXhr = true


let peekRequestHeaderListener = function (request) {
    // 默认仅捕获xhr请求；判断请求是否为 xhr 异步请求,并过滤非xhr请求
    if (onlyCatchXhr && request.type !== "xmlhttprequest") {
        console.log("跳过非xhr异步请求")
        return;
    }
    // 最多存储100个请求
    if (requestArr.length >= 100) {
        requestArr = []
    }
    console.log("存储请求：", request.url)
    requestArr.push(request)
    chrome.storage.local.set({"requestArr": requestArr})

}


chrome.webRequest.onBeforeSendHeaders.addListener(
    peekRequestHeaderListener
    ,
    {urls: ["<all_urls>"]},
    // extraHeaders才能拿到cookie等敏感信息
    ["requestHeaders", "extraHeaders"]
);


setInterval(() => {
    chrome.storage.local.get("requestArr", function (storage) {
        if (!storage.requestArr || storage.requestArr.length === 0) {
            requestArr = storage.requestArr
        }
    })

    chrome.storage.local.get("onlyCatchXhr", function (storage) {
        onlyCatchXhr = storage.onlyCatchXhr
        console.log("当前onlyCatchXhr状态：", onlyCatchXhr)
    })
}, 500)