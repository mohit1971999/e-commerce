var btn1 = document.getElementById("btn1");
var btn2 = document.getElementById("btn2");

var loginEmail = document.getElementById("email");
var loginPass = document.getElementById("loginPass");
var loginSubmit = document.getElementById("loginSubmit");

var signUpName = document.getElementById("name");
var signUpEmail = document.getElementById("mail");
var pass = document.getElementById("SignUpPass");
var confirmPass = document.getElementById("passConfirm");
var invalidPass = document.getElementById("noMatch");
var signUpSubmit = document.getElementById("signUpSubmit");

var signUpDiv = document.getElementsByClassName("signUp")[0];
var loginDiv = document.getElementsByClassName("login")[0];

var result = document.getElementById("result");

btn1.addEventListener("click", function(event){
    loginDiv.style.display = "block";
    signUpDiv.style.display = "none";
    btn1.style.border = "2px solid #808080";
    btn2.style.border = "none";
    btn1.style.backgroundColor = "springgreen";
    btn1.style.fontWeight = "bold";
    btn2.style.fontWeight = "100";
    btn2.style.backgroundColor = "White";
});

btn2.addEventListener("click", function(event){
    loginDiv.style.display = "none";
    signUpDiv.style.display = "block";
    btn2.style.border = "2px solid #808080";
    btn1.style.border = "none";
    btn2.style.backgroundColor = "springgreen";
    btn2.style.fontWeight = "bold";
    btn1.style.fontWeight = "100";
    btn1.style.backgroundColor = "White";
});

var f = document.getElementsByTagName("form")[0];
var f2 = document.getElementsByTagName("form")[1];

var fileuploading = document.getElementById("avatar");
var file;
fileuploading.addEventListener("change", function(){
    fileuploading = document.getElementById('avatar');
    file = fileuploading.files[0];
    console.log(file);
})

f.addEventListener("submit", function(event){
    event.preventDefault();
    var req = new XMLHttpRequest();
    req.open("POST", "/login");
    var obj = {
        email:loginEmail.value,
        password: loginPass.value
    };
    req.setRequestHeader("Content-type","application/json");
    req.send(JSON.stringify(obj));
    req.addEventListener("load", function(){
        var res = JSON.parse(req.responseText);
        console.log(res);
        if(res.continue){
            result.innerHTML = "Successful.";
            result.style.color = "Green";
            window.location.href = res.user;
        }
        else{
            result.innerHTML = res.result;
            result.style.color = "Red";
        }
    });
});

f2.addEventListener("submit", function(event){
    event.preventDefault();
    if(pass.value != confirmPass.value){
        invalidPass.style.display = "block";
    }
    else{
        invalidPass.style.display = "none";
        var req = new XMLHttpRequest();
        req.open('POST', "/signup");
        var formData = new FormData();
        formData.append('name', signUpName.value);
        formData.append('email', signUpEmail.value);
        formData.append('avatar', file, 'avatar');
        formData.append('password', confirmPass.value);
        req.send(formData);
        req.addEventListener("load", function(){
            var res = JSON.parse(req.responseText);
            if(res.continue){
                result.innerHTML = "Successful";
                result.style.color = "Green";
                window.location.href = "./home.ejs";
            }
            else{
                result.innerHTML = res.result;
                result.style.color = "Red";
            }
        });
    }
});