const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve all static files from the current directory
app.use(express.static(__dirname));


// Optional: Custom 404 page
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
