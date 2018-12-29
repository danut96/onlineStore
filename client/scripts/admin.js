function getCategories(){    
    req = new XMLHttpRequest();
    req.open('GET', '/categories');
    req.onreadystatechange = () => {
        if(req.readyState === 4 && req.status === 200) {
            var res = JSON.parse(req.responseText);
            // create select options for categories and subcategories
            var selectCategories = document.getElementsByTagName('select')[0];
            for(let i = 0; i < res.length; i++){
                var option = document.createElement('OPTION');
                option.innerHTML = res[i][0];
                option.value = `${res[i][0]}`;
                selectCategories.appendChild(option);
            }
        }
    }
    req.send();
}

function request(reqId, type, body, res){
    var req = new XMLHttpRequest();
    req.open('GET', `/request?id=${reqId}&result=${res}`);
    req.onreadystatechange = () => {
        if(req.status === 200 && req.readyState === 4){
            location.reload();
        }
    }
    req.send();
    if(type === 'ADD' && res === 'accepted'){
        var req2 = new XMLHttpRequest();
        req2.open('POST', `/add-product?id=${reqId}`);
        req2.setRequestHeader("Content-Type", "application/json");
        req2.send(body);
        location.reload();
    }
    if(type === 'EDIT' && res === 'accepted'){
        var req2 = new XMLHttpRequest();
        req2.open('POST', '/edit');
        req2.setRequestHeader("Content-Type", "application/json");
        req2.send(body);
        location.reload();
    }
    if(type === 'DELETE' && res === 'accepted'){
        var req2 = new XMLHttpRequest();
        req2.open('GET', `/delete?id=${body}`);
        req2.onreadystatechange = () => {
            if(req2.status === 200 && req2.readyState === 4){
                location.reload();
            }
        }
        req2.send();
    }
    if(type === 'ROLE UPGRADE' && res === 'accepted'){
        var req2 = new XMLHttpRequest();
        req2.open('POST', '/edit-roles');
        req2.setRequestHeader("Content-Type", "application/json");
        req2.send(body);
        location.reload();
    }
}