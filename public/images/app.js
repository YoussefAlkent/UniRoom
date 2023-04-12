const express = require('express');
const app = express();


app.set('view engine', 'ejs');


app.get('/about', (req, res) => {
    // Data 
    const data = {
        mission: 'our mission is to create a simple and efficient online system for any student at Alamein International University to book housing for short- and long-term stays..',
        teams: [
            { name: 'member 1:', description: 'Youssef Bedair' },
            { name: 'member 2:', description: 'Omar El-Hamraway' },
            { name: 'member 3:', description: ' Rebecca Whitten' },
            { name: 'member 4:', description: 'Tedy Huang' },
            { name: 'member 5:', description: 'Khaled Bahaaeldin' }
        ]
    };
    res.render('about', data);
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
