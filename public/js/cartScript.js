var products = document.getElementById("cartProducts");
var increase = document.getElementsByClassName("increase");
var decrease = document.getElementsByClassName("decrease");
var deleteItem = document.getElementsByClassName("deleteItem");
var descButton = document.getElementsByClassName("description");
var description = document.getElementById("description");

for(i=0;i<descButton.length;i++){
    increase[i].addEventListener('click', function(event){
        var quantity = event.target.parentNode.getElementsByClassName("quant")[0];
        if(quantity.innerHTML <= 5){
            quantity.innerHTML = parseInt(quantity.innerHTML) + 1;
            var request = new XMLHttpRequest();
            request.open("POST", "/increase");
            request.setRequestHeader("Content-type", "application/json");
            var x = event.target.parentNode.id;
            request.send(JSON.stringify({id: x, quantity: parseInt(quantity.innerHTML)}));
        }
        else{
            window.alert("You can have maximum 5 number of a particular item.");
        }
    });
    decrease[i].addEventListener('click', function(event){
        var quantity = event.target.parentNode.getElementsByClassName("quant")[0];
        if(quantity.innerHTML > 0){
            quantity.innerHTML = parseInt(quantity.innerHTML) - 1;
            var request = new XMLHttpRequest();
            request.open("POST", "/decrease");
            request.setRequestHeader("Content-type", "application/json");
            var x = event.target.parentNode.id;
            request.send(JSON.stringify({id: x, quantity: parseInt(quantity.innerHTML)}));
        }
        else{
            window.alert("You cannot have less than 1 quantity of any item.");
        }
    });
    deleteItem[i].addEventListener('click', function(event){
        var x = event.target.parentNode.id;
        var item = document.getElementById(x);
        item.parentNode.removeChild(item);
        var request = new XMLHttpRequest();
        request.open("POST", "/delete");
        request.setRequestHeader("Content-type", "application/json");
        request.send(JSON.stringify({id: x}));
    })
    descButton[i].addEventListener("click", function(event){
        var request = new XMLHttpRequest();
        request.open("POST", "/desc");
        request.setRequestHeader('Content-type', 'application/json');
        var x = event.target.parentNode.id;
        var obj = {
            id: x,
        };
        request.send(JSON.stringify(obj));
        request.addEventListener("load", function(){
            var res = JSON.parse(request.responseText);
            pdimage.src = res.img_add;
            descp.innerHTML = res.pddesc;
            description.style.display = "block";
        });
    });
}

var closeButton = document.getElementById("closeIcon");
var descp = document.getElementById("descript");
var pdimage = document.getElementById("pdImage");

closeButton.addEventListener("click", function(event){
    description.style.display = "none";
});