const express = require('express')
const port = process.env.port || 5000;

module.exports = function(discordClient) {
    let app = express();
    app.set('port', port);
    app.use(express.json());
    app.post('/notify-user/:userid/:channelid', async function (req, res, next) {
        try {
            discordClient.rest.post(`/channels/${req.params.channelid}/messages`, {
                body: {
                    content: `Hi, your item ${req.body.url} fell under the price $${req.body.price}`,
                    flags: 1<<6
                }
            });
            res.sendStatus(200);
        } catch (error) {
            res.sendStatus(400);
        }
    });
    return app;
};
  

