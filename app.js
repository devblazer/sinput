var http = require('http'),
    fs = require('fs'),
    path = require('path');

// Send index.html to all requests
var app = http.createServer(function(request, response) {
    var filePath = './public_html' + request.url;
    if (filePath == './public_html/')
        filePath = './public_html/index.html';

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end();
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});


// Socket.io server listens to our app
var io = require('socket.io').listen(app);

var keyListeners = {};

// Emit welcome message on connection
io.on('connection', function(socket) {
    var inputPassword = false;
    var vrPassword = false;

    socket.on('input_identifier',function(val){
        inputPassword = val;
    });
    socket.on('vr_identifier',function(val){
        vrPassword = val;
        keyListeners[val] = socket;
    });
    socket.on('disconnect',function(){
        if (vrPassword!==false)
            delete(keyListeners[vrPassword]);
    });

    socket.on('keychange', function(val){
        if (inputPassword!==false && keyListeners[inputPassword])
            keyListeners[inputPassword].emit('keychange',val);
    });
/*    socket.on('keydown', function(val){
        if (inputPassword!==false && keyListeners[inputPassword])
            keyListeners[inputPassword].emit('keydown',val);
    });*/
});

app.listen(3000);