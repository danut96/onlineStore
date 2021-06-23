function left(i){
    var container = document.getElementsByClassName('slider')[i];
    sideScroll(container, 'left', 1, 250, 5);
};

function right(i){
    var container = document.getElementsByClassName('slider')[i];
    sideScroll(container, 'right', 1 , 250, 5);
};

function sideScroll(element, direction, speed, distance, step){
    scrollAmount = 0;
    var slideTimer = setInterval(function(){
        if(direction == 'left'){
            element.scrollLeft -= step;
        } else {
            element.scrollLeft += step;
        }
        scrollAmount += step;
        if(scrollAmount >= distance){
            window.clearInterval(slideTimer);
        }
    }, speed);
}
