// create list of categories
window.onload = function categories(){
    req = new XMLHttpRequest();
    req.open('GET', '/categories');
    req.onreadystatechange = () => {
        if(req.readyState === 4 && req.status === 200) {
            var res = JSON.parse(req.responseText);
            // create menu with categories and subcategories
            var menu = document.getElementsByClassName('categories')[0];
            for(let i = 0; i < res.length; i++){
                var li = document.createElement('LI');
                var ul = document.createElement("UL");
                var liref = document.createElement('A');
                liref.href = `/search?category=${res[i][0]}`;
                liref.innerHTML = res[i][0];
                li.appendChild(liref);
                for(let j = 1; j < res[i].length; j++){
                    var li2 = document.createElement('LI');
                    var liref2 = document.createElement('A');
                    liref2.href = `/search?subcategory=${res[i][j]}`;
                    liref2.innerHTML = res[i][j];
                    li2.appendChild(liref2);
                    ul.appendChild(li2);
                }
                li.appendChild(ul);
                menu.appendChild(li);
            }
        }
    }
    req.send();
    var slider = document.querySelector(".rangeslider");
    if(!slider) return;
    priceAndSeller();
}

function priceAndSeller(){
    var slider = document.querySelector(".rangeslider");
    rangeS = slider.querySelectorAll("input[type=range]"),
    numberS = slider.querySelectorAll("input[type=number]");
    rangeS.forEach(el => {
		el.oninput = function() {
			var slide1 = parseFloat(rangeS[0].value);
			var slide2 = parseFloat(rangeS[1].value);

			if (slide1 > slide2) {
				[slide1, slide2] = [slide2, slide1];
			}

			numberS[0].value = slide1;
			numberS[1].value = slide2;
		};
	});

	numberS.forEach(el => {
		el.oninput = function() {
			var number1 = parseFloat(numberS[0].value);
			var	number2 = parseFloat(numberS[1].value);

			if (number1 > number2) {
				var tmp = number1;
				numberS[0].value = number2;
				numberS[1].value = tmp;
			}

			rangeS[0].value = number1;
			rangeS[1].value = number2;
		};
	});
}

