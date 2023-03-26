// 全局数据展示popup页中的元素
var element = undefined


function task() {
    chrome.storage.local.get("requestArr", function (requestArrStorage) {
        let requestArr = requestArrStorage.requestArr;
        if (!requestArr || requestArr.length === 0) {
            return;
        }

        // 消费数据，并更新弹出之后的数据
        handlerRequestArr(requestArr)
        chrome.storage.local.set({"requestArr": requestArr})
    })
}

function findDataElement() {
    if (!element) {
        // 找到id=data的元素
        element = document.getElementById('data');
    }
    return element;
}

function handlerRequestArr(requestArr) {
    for (let i = requestArr.length - 1; i >= 0; i--) {
        if (!findDataElement()) {
            continue;
        }
        handlerRequest(requestArr[i])
        // 删除数组中的元素
        requestArr.splice(i, 1)
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
    let title = "请求->" + method + " " + url + " header数据: <br>";
    let jsonResult = JSON.stringify(result);
    show(title + jsonResult)
}

function show(text) {
    appendTagToData(element, "p", text)
}

function appendTagToData(dataElement, tagName, text) {
    // 创建标签并追加到data元素中
    let tagElement = document.createElement(tagName);
    tagElement.innerHTML = text;

    // 添加按钮
    let btnElement = document.createElement('button');
    btnElement.innerText = '点击复制';
    btnElement.addEventListener('click', (event) => {
        const parentTagElement = event.target.parentNode;
        // 写入剪切板
        navigator.clipboard.writeText(parentTagElement.innerText.split("\n").slice(1).join().replace("点击复制", ""))
            .then(() => {
                // popup中的脚本打印无法打印值浏览器页面控制台
                console.log("Text was copied to clipboard");
            })
            .catch((error) => {
                console.error("Failed to copy text: ", error);
            });
    });
    tagElement.appendChild(btnElement);

    // 添加标签，标签总数不能大于 tagTotal
    let tagTotal = 30;
    let tagCount = dataElement.getElementsByTagName(tagName).length;
    if (tagCount >= tagTotal) {
        let lastChild = dataElement.lastChild;
        while (lastChild && lastChild.tagName !== tagName.toUpperCase()) {
            lastChild = lastChild.previousSibling;
        }
        if (lastChild) {
            dataElement.removeChild(lastChild);
        }
    }
    dataElement.insertBefore(tagElement, dataElement.lastChild);
}


// 定时获取数据
setInterval(task, 200)
