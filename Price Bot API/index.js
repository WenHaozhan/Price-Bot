const {discordAppURL, appPort} = require('./config.json')
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : 'localhost',
    port : 5432,
    user : 'postgres',
    password : 'ENTER PASSWORD HERE',
    database : 'pricebotdb'
  },
  /*pool: {
    afterCreate : function (conn, done) {
        console.log("Connected");
        done(null, conn);
    }
  }*/
});


//knex.select().from('sessions').then((q)=>{console.log(q)});
//knex.select().from('sessions').then((q)=>{console.log(q); knex.destroy();});

const express = require('express');
const cors = require("cors");
const app = express();
const port = process.env.port || 3000;

const crypto = require('crypto');
const { Knex } = require('knex');

// knex('sessions').insert({
//     id: generateRandomString(32),
//     time_created: knex.raw('CURRENT_TIMESTAMP'),
//     time_expire: knex.raw("CURRENT_TIMESTAMP + INTERVAL '1 hour'")
// }).catch((error) => {
//     console.log(error);
// });

app.use(express.json());
app.use(cors());

app.post('/create-session', async function (req, res, next) {
    try{
        let uid = generateRandomString(32);
        await knex('sessions').insert({
            id: generateRandomString(32),
            time_created: knex.raw('CURRENT_TIMESTAMP'),
            time_expire: knex.raw("CURRENT_TIMESTAMP + INTERVAL '1 hour'"),
            userid: BigInt(req.body.userid)
        });
        res.type('text/plain');
        res.send(uid);
    } catch(error) {
        console.log(error);
        res.sendStatus(400);
    }
});

app.post('/notify-user/:userid/:channelid', async function (req, res, next) {
    try{
        let url = new URL(discordAppURL);
        url.port = appPort;
        let notifid = req.body.notifid;
        await knex.del().from('notifications').where('id', notifid).andWhere('userid', BigInt(req.params.userid));
        url.pathname = `/notify-user/${req.params.userid}/${req.params.channelid}`;
        response = await fetch(url, {
            method : 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'url': req.body.url,
                'price': req.body.price
            })
        });
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

app.get('/notifications/:userid', async function (req, res, next) {
    try{
        let userid = req.params.userid;
        let arr = await knex.select().from('notifications').where('userid', knex.raw(`'${userid}'::bigint`));
        res.send(arr);
    } catch(error) {
        console.log(error);
        res.sendStatus(400);
    }
});

app.post('/notifications/:userid', async function (req, res, next) {
    try{
        let userid = req.params.userid;
        let channelid = req.body.channelid;
        if (channelid === undefined) {
            res.status(400);
            res.send("Did not contain channel-id");
            return;
        }
        let notification = req.body;
        notification.userid = BigInt(userid);
        notification.channelid = BigInt(notification.channelid);
        notification.price = parseFloat(notification.price);
        let arr = await knex.insert(notification).into('notifications');
        res.sendStatus(200);
    } catch(error) {
        console.log(error);
        res.sendStatus(400);
    }
});

app.delete('/notifications/:userid/:notifid', async function (req, res, next) {
    try {
        let userid = req.params.userid;
        let notifid = req.params.notifid;
        await knex.del().from('notifications').where('id', notifid).andWhere('userid', BigInt(userid));
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(400)
        res.send(error);
    }
});

app.patch('/notifications/:userid/:notifid', async function (req, res, next) {
    try {
        let userid = req.params.userid;
        let notifid = req.params.notifid;
        let query = knex('notifications');
        if (req.body.price) {
            query.update({price: parseFloat(req.body.price)});
        }
        await query.where("id", notifid).andWhere("userid", BigInt(userid));
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.status(400)
        res.send(error);
    }
});

app.put('/modify-notifications/:userid', async function (req, res, next) {
    //check each notif is valid
    //validate userid

});

// 
app.post('/create-notifications/:userid', async function (req, res, next) {

    //validate userid is associated with a valid session
    try{
        let userid = req.params.userid;
        let notifications = req.body.notifications.map( (obj) => {
            obj.userid = userid;
            return obj;
        });
        console.log(notifications.length);
        if (notifications.length > 0) {
            //knex.insert(notifications).into('notifications').then();
            await knex.insert(notifications).into('notifications').then();
        }
        res.sendStatus(200);
    } catch(error) {
        console.log(error);
        res.sendStatus(400);
    }
});

app.get('/validate-user/:userid', async function (req, res, next) {
    if (await validateUser(req.params.userid, knex)) {
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
})


const server = app.listen(port, () => {
    console.log("Listening");
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
    knex.destroy();
    server.close();
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    const array = new Uint32Array(length);
    crypto.webcrypto.getRandomValues(array);
    return array.reduce((acc, cur) => {return acc + characters[cur % charactersLength];}, '');
}

async function validateUser(userid, knex) {
    let arr = await knex.select().from('sessions').where('userid', BigInt(userid)).andWhere('time_expire', '>' , knex.raw('CURRENT_TIMESTAMP'));
    if (arr.length == 0) {
        return false;
    }
    return true; 
}
