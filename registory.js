var Sortable = require('sortablejs');
const shortid = require('shortid');

window.onload = function () {
    entry();
};

function entry() {
    document.getElementById('add').onclick = addItem;
    document.getElementById('generate').onclick = generateRoute;
    var sortable = new Sortable(document.getElementById('items'), { group: 'shared', chosenClass: "picked", animation: 150 });
    var sortable_chosen = new Sortable(document.getElementById('items-chosen'), { group: 'shared', chosenClass: "picked", animation: 150});
    var registories = [];
    updateAll();
}

// View

function updateView(registories) {
    let view = document.getElementById('items')

    // First, remove all of them
    view.innerHTML = "";

    // Then, view brandnew registories again
    registories.forEach((item) => {
        view.appendChild(dataToElement(item));
    });
}

function dataToElement(data) {
    var elem_name = document.createElement("div");
    elem_name.innerText = data.name;
    elem_name.className = "name";
    var elem_url = document.createElement("div");
    elem_url.innerText = data.url;
    elem_url.className = "url";
    var elem_remove_button = document.createElement("input")
    elem_remove_button.type = "button"
    elem_remove_button.value = "削除"
    elem_remove_button.className = "item-button";
    elem_remove_button.onclick = () => { removeItem(elem_remove_button) };
    var elem_edit_button = document.createElement("input")
    elem_edit_button.type = "button"
    elem_edit_button.value = "再編集"
    elem_edit_button.className = "item-button";
    elem_edit_button.onclick = () => { editItem(elem_edit_button) };
    var elem = document.createElement("div");
    elem.className = "item myHandle";
    elem.id = data.id;
    elem.appendChild(elem_name);
    elem.appendChild(elem_url);
    elem.appendChild(elem_remove_button);
    elem.appendChild(elem_edit_button);
    return elem;
}

function elementToData(elem) {
    var id = elem.id;
    var name;
    var url;

    Array.from(elem.children).forEach((el) => {
        if (el.className === "name") {
            name = el.innerText;
        }
        else if(el.className === "url")
        {
            url = el.innerText;
        }
    });

    return {id: id, name: name,  url: url};
}

function enterEditMode(elem) {
    Array.from(elem.children).forEach((el) => {
        if (el.className === "name" || el.className === "url") {
            el.contentEditable = true;
            el.role = "textbox";
        }
        else if(el.className === "item-button")
        {
            el.hidden = true;
        }
    });
    var elem_update_button = document.createElement("input")
    elem_update_button.type = "button"
    elem_update_button.value = "更新"
    elem_update_button.className = "item-button";
    elem_update_button.onclick = function(){ updateItem(elem_update_button) };
    var elem_cancel_button = document.createElement("input")
    elem_cancel_button.type = "button"
    elem_cancel_button.value = "キャンセル"
    elem_cancel_button.className = "item-button";
    elem_cancel_button.onclick = function(){ cancelUpdateItem(elem_cancel_button) };
    elem.appendChild(elem_update_button);
    elem.appendChild(elem_cancel_button);
}

function specifyRemoveId(elem) {
    return elem.parentNode.id;
}

function clearInputFields() {
    document.getElementById('add-name').innerText = ""
    document.getElementById('add-url').innerText = ""
}

function getRouteFromView() {
    var route = [];
    Array.from(document.getElementById("items-chosen").children).forEach((el) => {
        route.push(elementToData(el));
    });

    return route;
}

// Controller

function addItem() {
    var item = {
        id: shortid.generate(),
        name: document.getElementById('add-name').innerText,
        url: document.getElementById('add-url').innerText
    };
    try { 
        valitate(item)
        add(item);
        clearInputFields();
        updateAll();
    }
    catch(e){ 
        alert(e)
    }    
}

function removeItem(elem) {
    remove(specifyRemoveId(elem));
    updateAll();
}

function editItem(elem) {
    enterEditMode(elem.parentNode);
}

function updateItem(elem) {
    var item = elementToData(elem.parentNode);
    try { 
        valitate(item)
        update(item);
        updateAll();
    }
    catch(e){ 
        alert(e)
    }
}

function cancelUpdateItem(elem) {
    updateAll();
}

function updateAll() {
    getAllItems(updateView);
}

function generateRoute() {
    var url = routeToUrl(getRouteFromView());
    window.open(url, '_blank');
}
 
// Model

const dbName = 'MyRouteRegistoriesDB';
const storeName = 'MyRouteRegistories';

// var registories = [];

function getAllItems(callback) {
    var openReq = indexedDB.open(dbName);

    openReq.onupgradeneeded = function (event) {
        var db = event.target.result;
        db.createObjectStore(storeName, {keyPath : 'id'})
        console.log('db upgrade');
    }
    openReq.onsuccess = function (event) {
        var db = event.target.result;
        var trans = db.transaction(storeName, 'readonly');
        var store = trans.objectStore(storeName);
        
        var getReq = store.getAll().onsuccess = function(event){
            callback(event.target.result);
            // 接続を解除する
            db.close();
        }
    }
    openReq.onerror = function (event) {
        // 接続に失敗
        alert('db open error');
    }
}

function add(item) {
    var openReq = indexedDB.open(dbName);
    openReq.onsuccess = function (event) {
        var db = event.target.result;
        var trans = db.transaction(storeName, 'readwrite');
        var store = trans.objectStore(storeName);
        
        var getReq = store.put(item).onsuccess = function(event){
            // 接続を解除する
            db.close();
        }
    }
    openReq.onerror = function (event) {
        // 接続に失敗
        alert('db open error');
    }
}

function remove(id) {
    var openReq = indexedDB.open(dbName);
    openReq.onsuccess = function (event) {
        var db = event.target.result;
        var trans = db.transaction(storeName, 'readwrite');
        var store = trans.objectStore(storeName);
        
        var getReq = store.delete(id).onsuccess = function(event){
            // 接続を解除する
            db.close();
        }
    }
    openReq.onerror = function (event) {
        // 接続に失敗
        alert('db open error');
    }
}

function update(item) {
    var openReq = indexedDB.open(dbName);
    openReq.onsuccess = function (event) {
        var db = event.target.result;
        var trans = db.transaction(storeName, 'readwrite');
        var store = trans.objectStore(storeName);
        
        var getReq = store.get(item.id).onsuccess = function(event){
            var tgt = event.target.result;
            tgt.name = item.name;
            tgt.url = item.url;
            var putReq = store.put(item).onsuccess = function(event){
                // 接続を解除する
                db.close();
            }
        }
    }
    openReq.onerror = function (event) {
        // 接続に失敗
        alert('db open error');
    }
    // var id = item.id;
    // var tgt = registories[registories.findIndex((it) => { return (it.id === id) })];
    // tgt.name = item.name;
    // tgt.url = item.url;
}

function valitate(item) {

    if(item.name === "")
    {
        throw "名前が空です。"
    }

    var regex_google_map_place_url = /https:\/\/www\.google\.co\.jp\/maps\/place\/.+/;

    if(regex_google_map_place_url.test(item.url) === false)
    {
        throw "URLにはGoogleマップのもの(\"https://www.google.co.jp/maps/place/\"で始まるURL)を指定してください。"
    }

    return 0;
}

function routeToUrl(route) {
    var url = "https://www.google.co.jp/maps/dir"
    route.forEach((it)=>{
        var place = brewPlace(it.url)
        url = url.concat("/")
        url = url.concat(place);
    });
    url = url.concat("/data=!4m4!4m3!2m2!1b1!2b1");
    return url;
}

function brewPlace(url) {
    var regex_google_map_place_url = /https:\/\/www\.google\.co\.jp\/maps\/place\/(.+)\/.+/;
    var m = url.match(regex_google_map_place_url);
    return m[1];
}