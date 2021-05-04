var pdimage = document.getElementById('pdimage');
var pdid = document.getElementById('pdid');

window.addEventListener("load", (event)=>{
    pdid.value = Date.now();
})

pdimage.addEventListener('change', function(){
    var file = pdimage.files[0];
    if(file.type.includes('image')!= true)
        window.alert('Please choose an image file.');
});

var form = document.getElementById('pdform');

var pdname = document.getElementById('pdname');
var pddesc = document.getElementById('pddesc');
var pdprice = document.getElementById('pdprice');
var pdquant = document.getElementById('pdquant');


form.addEventListener('submit', (event)=>{
    event.preventDefault();
    var request = new XMLHttpRequest();
    request.open("POST", "/addproduct");
    var formdata = new FormData(form);
    formdata.append("pd_id", pdid.value);
    request.send(formdata);
    request.addEventListener('load', ()=>{
        var res = JSON.parse(request.responseText);
        window.alert(res.result);
        form.reset();
        pdid.value = Date.now();
    });
});