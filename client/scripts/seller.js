function hide(i){
    document.getElementsByClassName('manage')[0].style.display = "none";
    document.getElementsByClassName("requests")[0].style.display = "none";
    document.getElementsByClassName('manageproduct')[0].style.display = "block";
    document.getElementsByClassName('manageproduct')[0].getElementsByTagName('div')[i].style.display = "block";
    req = new XMLHttpRequest();
    req.open('GET', '/categories');
    req.onreadystatechange = () => {
        if(req.readyState === 4 && req.status === 200) {
            var res = JSON.parse(req.responseText);
            // create select options for categories and subcategories
            var selectCategories = document.getElementsByTagName('select')[0];
            var selectSubcategories = document.getElementsByTagName('select')[1];
            for(let i = 0; i < res.length; i++){
                var option = document.createElement('OPTION');
                option.innerHTML = res[i][0];
                var k = selectCategories.selectedIndex;
                while(selectSubcategories.hasChildNodes()){
                    selectSubcategories.removeChild(selectSubcategories.firstChild);
                }
                for(let j = 1; j < res[0].length; j++){
                    var option2 = document.createElement('OPTION');
                    option2.name = `${res[0][j]}`;
                    option2.innerHTML = res[0][j];
                    selectSubcategories.appendChild(option2);
                }
                selectCategories.onchange = () => {
                    var k = selectCategories.selectedIndex;
                    while(selectSubcategories.hasChildNodes()){
                        selectSubcategories.removeChild(selectSubcategories.firstChild);
                    }
                    for(let j = 1; j < res[k].length; j++){
                        var option2 = document.createElement('OPTION');
                        option2.name = `${res[k][j]}`;
                        option2.innerHTML = res[k][j];
                        selectSubcategories.appendChild(option2);
                    }
                }
                selectCategories.appendChild(option);
            }
        }
    }
    req.send();
}

function preview(){
    var input = document.getElementsByClassName('image')[0];
    if(input.files && input.files[0]){
        var reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('img').setAttribute('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

