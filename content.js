var element = undefined
function task() {
    chrome.storage.local.get("requestArr", function (requestArrStorage) {
        let requestArr = requestArrStorage.requestArr;
        if (!requestArr || requestArr.length === 0) {
            return;
        }

        handlerRequestArr(requestArr)
        // 更新弹出之后的数据
        chrome.storage.local.set({"requestArr":[]})
    })
}

function findDataElement() {
    if (!element){
        // 找到id=data的元素
        element = document.getElementById('data');
    }
    return element;
}

function handlerRequestArr(requestArr) {
    for (let i = requestArr.length - 1; i >= 0; i--) {
        if (!findDataElement()) {
            console.log("--")
            continue;
        }
        console.log(requestArr)
        handlerRequest(requestArr[i])
        requestArr.spacing(i, 1)
        console.log(requestArr)
        console.log(requestArr.length)
    }
}

function handlerRequest(request) {
    let header = request.requestHeaders
    let method = request.method
    let url = request.url
    let result = {}
    for (let key in header) {
        if (!header.hasOwnProperty(key)) {
            return;
        }
        let headerItem = header[key];
        result[headerItem.name] = headerItem.value
    }
    let title = "请求：" + method + " " + url + " header数据--->\n";
    console.log(title)
    let jsonResult = JSON.stringify(result);
    console.log(jsonResult)
    show(title + jsonResult)
}

function show(text) {
    appendTagToData(element, "p", text)
}

function appendTagToData(dataElement, tagName, text) {


    // 创建标签并追加到data元素中
    let tagElement = document.createElement(tagName);
    tagElement.innerHTML = text;

    // 添加标记
    let tagCount = dataElement.getElementsByTagName(tagName).length;
    if (tagCount >= 20) {
        let lastChild = dataElement.lastChild;
        while (lastChild && lastChild.tagName !== tagName.toUpperCase()) {
            lastChild = lastChild.previousSibling;
        }
        if (lastChild) {
            dataElement.removeChild(lastChild);
        }
    }
    dataElement.insertBefore(tagElement, dataElement.firstChild);
}


setInterval(task, 1000)
