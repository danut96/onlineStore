function edit(){
    var id = Number(location.href.split("?")[1].split("=")[1]);
    var title = document.getElementsByClassName('title')[0].getElementsByTagName('span')[0].innerHTML;
    var description = document.getElementsByClassName('description')[0].getElementsByTagName('span')[0].innerHTML;
    if(document.getElementsByClassName('oldprice')[0] !== undefined) var x = Number(document.getElementsByClassName('oldprice')[0].getElementsByTagName('del')[0].innerHTML.replace('$', '').trim());
    if(document.getElementsByClassName('discount')[0] !== undefined) var y = Number(document.getElementsByClassName('discount')[0].getElementsByTagName('span')[0].innerHTML.replace('%', '').trim());
    var newprice = Number(document.getElementsByClassName('newprice')[0].getElementsByTagName('span')[0].innerHTML.replace('$', '').trim());
    var oldprice = (x === undefined || x === null) ? newprice  : x
    var discount = (y === undefined )? 100 - newprice / oldprice * 100 : y;
    var stock = document.getElementsByClassName('stock')[0].getElementsByTagName('span')[2].innerHTML;
    var req = new XMLHttpRequest();
    console.log(JSON.stringify({
        id: id,
        title: title,
        description: description,
        price: oldprice,
        discount: discount.toFixed(0),
        stock: stock
    }));
    req.open('POST', '/edit');
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({
        id: id,
        title: title,
        description: description,
        price: oldprice,
        discount: discount.toFixed(0),
        stock: stock
    }));
}