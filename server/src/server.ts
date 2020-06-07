import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';

const port = 3333;

const app = express();

app.use(cors());
app.use(express.json());

app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

app.listen(port, err => {
    if ( err ) console.log(err);
    else console.log(`Server running on port: ${port}`)
});
