let express = require('express');
let path = require('path');
let app = express();
let port = 8060;

app.use(express.static('clientes-app'));
app.get('*', (req, res, next)  => {
    res.sendFile(path.resolve('clientes-app/index.html'));
});
app.listen(port, () => {
    console.log('\n express escuchando sobre el puerto ' + port)

});

