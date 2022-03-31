import bodyParser from "body-parser";
import express from "express";
import http from "http";
import logger from "morgan";
import Path from "path";
'use strict';
export default (port, path, callback) => {
    const app = express();
    const server = http.createServer(app);
    // We’ll just store entries sent through REST in-memory here
    const items = [];
    // Basic middlewares: static files, logs, form fields
    app.use(express.static(Path.join(__dirname, path)));
    app.use(logger('dev'));
    app.use(bodyParser.urlencoded({ extended: true }));
    // GET `/items` -> JSON for the entries array
    app.get('/items', (req, res) => {
        res.json(items);
    });
    // POST `/items` -> Add an entry using the `title` field
    app.post('/items', (req, res) => {
        const item = (req.body.title || '').trim();
        if (!item) {
            return res.status(400).end('Nope!');
        }
        items.push(item);
        res.status(201).end('Created!');
    });
    // Listen on the right port, and notify Brunch once ready through `callback`.
    server.listen(port, callback);
};
