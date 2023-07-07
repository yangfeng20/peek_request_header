// 全局数据展示popup页中的元素
let element = undefined
let requestInfoArr = []


window.onload = function () {
    main()
};

function main() {

    // 定位数据渲染元素
    findDataElement()

    // 注册监听
    registrySelectListener()

    // 配置捕获xhr异步请求
    chrome.storage.local.get("onlyCatchXhr", function (storage) {
        catchXhrConfig(storage.onlyCatchXhr)
    })


    // 消费requestInfo信息
    chrome.storage.local.get("requestArr", function (storage) {
        let requestArr = storage.requestArr;
        if (!requestArr || requestArr.length === 0) {
            return;
        }

        // 构建requestInfoArr信息
        requestInfoArr = buildInfo(requestArr)

        // 默认筛选并渲染数据
        filterData()

        // 清空数据
        chrome.storage.local.set({"requestArr": [], "refresh": true})
    })


}

function catchXhrConfig(onlyCatchXhr) {
    if (onlyCatchXhr === undefined) {
        onlyCatchXhr = true;
    }
    const switchElem = document.getElementById("xhrSwitch");
    if (onlyCatchXhr) {
        switchElem.checked = true;
        chrome.storage.local.set({"onlyCatchXhr": true})
    } else {
        switchElem.checked = false;
        chrome.storage.local.set({"onlyCatchXhr": false})
    }
}

function buildInfo(requestArr) {
    let requestInfoArr = []
    requestArr.forEach(request => {
        requestInfoArr.push(buildRequestInfo(request))
    })
    return requestInfoArr
}


function findDataElement() {
    if (!element) {
        // 找到id=data的元素
        element = document.getElementById('data');
    }
    return element;
}

/**
 * 注册页面筛选输入框监听
 */
function registrySelectListener() {
    // 添加URL过滤筛选
    const filterInput = document.getElementById('urlInput');
    filterInput.addEventListener('input', filterData);

    // 添加请求方法过滤筛选
    const methodSelect = document.getElementById('methodSelect');
    methodSelect.addEventListener('change', filterData);

    // 添加请求方法过滤筛选
    const typeSelect = document.getElementById('typeSelect');
    typeSelect.addEventListener('change', filterData);

    // 仅捕获xhr异步请求
    const switchElem = document.getElementById("xhrSwitch");
    switchElem.addEventListener("click", (e) => {
        const updateStatus = e.target.checked
        catchXhrConfig(updateStatus)
    })
}


function buildRequestInfo(request) {
    let header = request.requestHeaders
    let method = request.method
    let url = request.url
    let type = request.type
    let result = {}
    for (let key in header) {
        if (!header.hasOwnProperty(key)) {
            return;
        }
        let headerItem = header[key];
        result[headerItem.name] = headerItem.value
    }
    let headers = JSON.stringify(result);

    // 构建请求信息对象
    return {
        method,
        url,
        type,
        headers
    }
}


// 渲染数据
function renderData(requestInfoArr) {
    const container = document.getElementById('data');
    container.innerHTML = '';

    for (let i = 0; i < requestInfoArr.length; i++) {
        const requestInfo = requestInfoArr[i];
        const dataDiv = document.createElement('div');

        // 添加标签内容
        const dataTag = document.createElement('p');
        dataTag.textContent = `Method: ${requestInfo.method}  | Type: ${requestInfo.type} | URL: ${requestInfo.url}`;
        dataDiv.appendChild(dataTag);

        // 添加按钮
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy Headers';
        // 使用自定义属性存储headers数据
        copyBtn.dataset.headers = JSON.stringify(requestInfo.headers);
        copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(requestInfo.headers)
                .then(() => {
                    console.log("copy success")
                })
                .catch(err => {
                    console.error('Failed to copy headers:', err);
                });
        });
        dataDiv.appendChild(copyBtn);

        container.appendChild(dataDiv);
    }
}

/**
 * 过滤数据并重新渲染
 */
function filterData() {
    const methodValue = document.getElementById('methodSelect').value.toLowerCase();
    const typeValue = document.getElementById('typeSelect').value.toLowerCase();
    const urlValue = document.getElementById('urlInput').value.toLowerCase();

    // 过滤数据并重新渲染
    renderData(filterDataInner(methodValue, typeValue, urlValue));
}

/**
 * 过滤数据
 * @param methodValue 请求方法 get post
 * @param typeValue 请求类型 xhr document
 * @param urlValue 请求url
 */
function filterDataInner(methodValue, typeValue, urlValue) {
    return requestInfoArr.filter(requestData =>
        (
            (methodValue === "all" ? true : requestData.method.toLowerCase() === methodValue) &&
            // 如果不是异步请求，就是其他所有类型
            (typeValue !== "xmlhttprequest" ? true : requestData.type.toLowerCase() === typeValue) &&
            requestData.url.toLowerCase().includes(urlValue)
        )
    );
}
