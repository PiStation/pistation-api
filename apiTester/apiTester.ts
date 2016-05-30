var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req:any, res:any){
    res.sendFile(__dirname + '/index.html');
});

http.listen(80, function(){
    console.log('listening on *:80');
});
