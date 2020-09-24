var express = require('express');
var router = express.Router();
const Note = require('../models/note');
const withAuth = require('../middlewares/auth');

router.post('/', withAuth, async (req, res) => {
    try {
        const { title, body } = req.body;
        let note = new Note({ title: title, body: body, author: req.user._id });
        await note.save();
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ error: 'Unable to create a new note.' });
    }
});

router.get('/', withAuth, async (req, res) => {
    try {
        let notes = await Note.find({ author: req.user._id });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Unable to get notes.' });
    }
});

router.get('/search', withAuth, async (req, res) => {
    try {
        const { query } = req.query;
        
        let notesByTitle = await Note
            .find({ author: req.user._id })
            .find({ $text: { $search: query } });
        if (notesByTitle.length > 0) {
            res.status(200).json(notesByTitle);
        } else {
            res.status(403).json({ error: 'Any notes was found.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Unable to get a note.' });
    }
});

router.get('/:id', withAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        let note = await Note.findById(id);
        if (note) {
            if (isOwner(req.user, note)) {
                res.status(200).json(note);
            } else {
                res.status(403).json({ error: 'Permission denied.' });
            }
        } else {
            res.status(404).json({ error: `Note id: ${id} was not found.` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Unable to get a note.' });
    }
});

router.put('/:id', withAuth, async (req, res) => {
    try {
        const { title, body } = req.body;
        const { id } = req.params;
        
        let note = await Note.findById(id);
        if (note) {
            if (isOwner(req.user, note)) {
                let note = await Note.findOneAndUpdate(
                    { _id: id },
                    { $set: { title: title, body: body, updated_at: Date.now() } },
                    { upsert: true, 'new': true }
                );
                res.status(200).json(note);
            } else {
                res.status(403).json({ error: 'Permission denied to update this note.' });
            }
        } else {
            res.status(404).json({ error: `Note id: ${id} was not found.` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Unable to update a note.' });
    }
});

router.delete('/:id', withAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        let note = await Note.findById(id);
        if (note) {
            if (isOwner(req.user, note)) {
                await Note.findOneAndDelete(
                    { _id: id }
                );
                res.status(200).json({ sucess: `Note id: ${id} was deleted.` });
            } else {
                res.status(403).json({ error: 'Permission denied to delete this note.' });
            }
        } else {
            res.status(404).json({ error: `Note id: ${id} was not found.` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete a note.' });
    }
});

const isOwner = (user, note) => {
    return (JSON.stringify(user._id) == JSON.stringify(note.author._id));
};

module.exports = router;