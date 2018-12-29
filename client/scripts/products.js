function orderBy(el){
    var href = window.location.href.split('&');
    var url = "";
    href.forEach(part => {
        if(part.indexOf("rating") === -1 && part.indexOf("discount") === -1 && part.indexOf("price") === -1) url += "&" + part;
    });
    url = url.substring(1);
    el.href = url + `&${el.name}`;
}

// function filter(min, max){
//     var filter = document.getElementById("filter");
//     var minPrice = document.getElementsByClassName("number")[0].getElementsByTagName("input")[0].value;
//     var maxPrice = document.getElementsByClassName("number")[0].getElementsByTagName("input")[1].value;
//     var sellers = document.getElementsByClassName("seller")[0].getElementsByTagName("input");
//     var stock = document.getElementsByClassName("fstock")[0].getElementsByTagName("input");
//     var filtered = [];
//     [...sellers].forEach(element => {
//         if(element.checked === true){
//             filtered.push(element.value);
//         }
//     });
//     var stocks = [];
//     [...stock].forEach(element => {
//         if(element.checked === true){
//             stocks.push(element.value);
//         }
//     });
//     var href = location.href.split("&");
//     href.forEach(part => part.replace("&", ""));
//     var url = "";
//     href.forEach(part => {
//         if(part.indexOf("seller") === -1 && part.indexOf("sellers") === -1 && part.indexOf("min") === -1 && part.indexOf("max") === -1 && part.indexOf("stock") === -1) url += "&" + part;
//     });
//     url = url.substring(1);
//     var fltr = "";
//     if(filtered.length === 0){
//         href.forEach(part => {
//             if(part.indexOf("sellers") !== -1 || part.indexOf("seller") !== -1) fltr += "&" + part; 
//         });
//     }else{
//         if(filtered.length > 1) filtered.forEach(part => fltr += "sellers=" + part + "&");
//         if(filtered.length === 1) fltr += "&seller=" + filtered[0];
//     }
//     if(stocks.length === 0){
//         href.forEach(part => {
//             if(part.indexOf("stock") !== -1) fltr += "&" + part ; 
//         });
//     }else{
//         stocks.forEach(part => fltr += "&stock=" + part);
//     }
//     if(minPrice === min && maxPrice === max){
//         href.forEach(part => {
//             if(part.indexOf("min") !== -1 || part.indexOf("max") !== -1) fltr += "&" + part ; 
//         });
//     }else{
//         fltr += `&min=${minPrice}&max=${maxPrice}`;
//     }
//     filter.href = url + fltr;
// }
var temp = "";

function filter(el){
    var filter = document.getElementById("filter");
    if(window.location.href.indexOf(el.name) === -1){
        temp += el.name + el.value;
        filter.href = window.location.href + temp;
    }else{
        let url = "";
        let href = window.location.href.split("&");
        href.forEach(part => {
            if(part.indexOf(el.name.substring(1)) === -1 && part !== "") url += "&" + part;
        });
        url = url.substring(1);
        url += `&${el.name}${el.value}`;
        filter.href = url;
    }
}

function filt(){
    let url =  window.location.href;
    var filter = document.getElementById("filter");
    var checkboxes = document.getElementsByClassName("cb");
    [...checkboxes].forEach(cbox => {
        // delete all fields with name 
        if(cbox.checked){
            [...checkboxes].forEach(checkbox => {
                if(checkbox.name.substring(1).split("=")[0] === cbox.name.substring(1).split("=")[0] && url.indexOf(checkbox.name.substring(1).split("=")[0]) !== -1) url = url.replace(new RegExp(checkbox.name),"");
            });
            console.log("----------- am sters");
            console.log(url);
        }
    });
    [...checkboxes].forEach(checkbox => {
        // add the new fields
        if(checkbox.checked){
            url += checkbox.name;
            console.log("----------- am adaugat");
        }
    });
    filter.href = url;
    console.log(url);
}
