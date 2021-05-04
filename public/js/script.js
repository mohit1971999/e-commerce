var description = document.getElementById("description");
var b = document.getElementById("main");
var leave = document.getElementById("logOut");

var closeIcon = document.getElementById("closeIcon");
var descButton = document.getElementsByClassName("description");
var descp = document.getElementById("descript");
var pdimage = document.getElementById("pdImage");
var addCart = document.getElementsByClassName("addCart");

for(i = 0;i<addCart.length;i++){
    addCart[i].addEventListener("click", function(event){
        var req = new XMLHttpRequest();
        req.open("POST", "/cart");
        req.setRequestHeader('Content-type', 'application/json');
        var obj = {
            pid:event.target.parentNode.id,
        };
        req.send(JSON.stringify(obj));
        req.addEventListener("load", function(){
            window.location.href = "./cart.ejs";
        });
    });
}

for(i=0;i<descButton.length;i++){
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

closeIcon.addEventListener("click", function(event){
    description.style.display = "none";
});

leave.addEventListener("click", function(event){
    var req = new XMLHttpRequest();
    req.open("POST", "/logout");
    req.setRequestHeader("Content-type", "Application/json");
    req.send();
    req.addEventListener("load", function(){
        window.location.href = "/";
    });
});