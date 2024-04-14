const express = require('express');
const app = express();
app.use(express.static('public'));

// joi for server side validation
const joi = require('joi');

// muilter for file uploads
const multer = require('multer');

app.use('/uploads', express.static('uploads'));
app.use(express.json());

// cors for cross domain
const cors = require('cors');
app.use(cors());

// mongoose for mongodb
const mongoose = require('mongoose');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage:storage});

mongoose
.connect('mongodb+srv://johnnyhyman97:uTWisK0o4AyspVWN@crafts-cluster.s0ji6c3.mongodb.net/?retryWrites=true&w=majority&appName=crafts-cluster')
.then(() => {
    console.log('connected to mongodb successfully');
})
.catch((error) => {
    console.log('unsuccessful connecting to mongodb: ', error);
});

const craftSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    supplies: [String]
});

const Craft = mongoose.model('Craft', craftSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + './index.html');
});

app.get('/api/crafts', async (req, res) => {
    const crafts = await Craft.find();
    res.send(crafts);
});

app.get('/api/crafts/:id', async(req, res) => {
    const id = req.params.id;
    const craft = await Craft.findOne({_id: id});
    res.send(craft);
});

// post = add
app.post('/api/crafts', upload.single('image'), async (req, res) => {
    const result = validateCraft(req.body);

    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const craft = new Craft({
        name: req.body.name,
        description: req.body.description,
        supplies: req.body.supplies.split(',')
    });

    if(req.file) {
        craft.image = req.file.filename;
    }

    await craft.save();
    res.send(craft);
});

// editing an existing item
app.put('/api/crafts/:id', upload.single('image'), async (req, res) => {
    const result = validateCraft(req.body);

    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    let fieldsToUpdate = {
        name: req.body.name,
        description: req.body.description,
        supplies: req.body.supplies.split(',')
    };

    if(req.file) {
        fieldsToUpdate.image = req.file.filename;
    }

    const id = req.params.id;

    const updateResult = await Craft.updateOne({_id: id}, fieldsToUpdate);
    res.send(updateResult);
});

// deleting an item
app.delete('/api/crafts/:id', async (req, res) => {
    const craft = await Craft.findByIdAndDelete(req.params.id);
    res.send(craft);
});

const validateCraft = (craft) => {
    const schema = joi.object({
        _id: joi.allow(''),
        name: joi.string().min(1).required(),
        description: joi.string().min(1).required(),
        supplies: joi.allow('')
    });

    return schema.validate(craft);
};

app.listen(3000, () => {});