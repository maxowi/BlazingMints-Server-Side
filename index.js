const express = require('express')
const axios = require('axios')
const requestIp = require('request-ip');
const app = express();
let cors = require('cors');
var bodyParser = require('body-parser')
const { Webhook, MessageBuilder } =require('discord-webhook-node')
const fs = require("fs");
const colors = require("colors");
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.json());
app.use(cors());
const time = () => {return new Date(Date.now()).toISOString()}

var launchpad_drop_details_requested = "https://webhooks.aycd.io/webhooks/api/v1/send/15553/9787cc4f-a9ab-4779-941a-427ac0bd647b"
var launchpad_add_drop_webhook = "https://webhooks.aycd.io/webhooks/api/v1/send/15554/be7ac5db-e36c-44c3-94b2-9022a8622d77"
var launchpad_remove_drop_webhook = "https://webhooks.aycd.io/webhooks/api/v1/send/15555/0f498a03-dbef-4e04-96fe-e526ee4c377d"

process.on('uncaughtException', err => {
    console.log(`Uknown Error:`,err.message)
})

app.get('/add_drop/:data', (req, res) => {
    var data_from_user = req.params.data
    var drop_name = data_from_user.split("___")[0]
    var candyMachine = data_from_user.split("___")[1]
    var data_to_send = JSON.parse(fs.readFileSync('./Launchpad_Drops.json').toString('utf-8'))

    var all_drop_names = []
    for (let i = 0; i < data_to_send['Drops'].length ; i++) {
        all_drop_names.push(data_to_send['Drops'][i]['DropName'])
    }
    if (!all_drop_names.includes(drop_name)){
        var data = {'DropName' : drop_name, 'CandyMachine' : candyMachine}
        data_to_send['Drops'].push(data)
        var jsonContent = JSON.stringify(data_to_send);
        fs.writeFile("./Launchpad_Drops.json", jsonContent, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                res.send(false)
            }
            else {
                console.log("JSON file has been saved.")

                const hookk = new Webhook(launchpad_add_drop_webhook)
                const embed = new MessageBuilder()
                    .setTitle('Drop Added')
                    .addField('IP-Address:', `${req.ip}`)
                    .addField('Drop-Name:', `${drop_name}`)
                    .addField('Drop-CandyMachine:', `${candyMachine}`)
                    .setColor('#ff4747')
                    .setThumbnail('https://media.discordapp.net/attachments/840649597604724747/916762396020862976/unknown_4.png')
                    .setFooter(`BlazingMints`, 'https://media.discordapp.net/attachments/840649597604724747/916762396020862976/unknown_4.png')
                    .setTimestamp()
                hookk.send(embed)

            }
        });
        res.send("added")
    }
    else {
        res.send("already added")
    }

})

app.get('/remove_drop/:dropname', (req, res) => {
    var drop_name_from_user = req.params.dropname

    var data_to_send = JSON.parse(fs.readFileSync('./Launchpad_Drops.json').toString('utf-8'))

    var all_drop_names = []
    for (let i = 0; i < data_to_send['Drops'].length ; i++) {
        all_drop_names.push(data_to_send['Drops'][i]['DropName'])
    }
    if (all_drop_names.includes(drop_name_from_user)){
        for (let i = 0; i < all_drop_names.length; i++) {
            if (all_drop_names[i] === drop_name_from_user){
                data_to_send['Drops'].splice(i,i+1)
            }
        }
        var jsonContent = JSON.stringify(data_to_send);
        fs.writeFile("./Launchpad_Drops.json", jsonContent, 'utf8', function (err) {
            if (err) {
                console.log("An error occured while writing JSON Object to File.");
                res.send(false)
            }
            else {
                console.log("JSON file has been saved.");


                const hookk = new Webhook(launchpad_remove_drop_webhook)
                const embed = new MessageBuilder()
                    .setTitle('Drop Removed')
                    .addField('IP-Address:', `${req.ip}`)
                    .addField('Drop-Name:', `${drop_name_from_user}`)
                    .setColor('#ff4747')
                    .setThumbnail('https://media.discordapp.net/attachments/840649597604724747/916762396020862976/unknown_4.png')
                    .setFooter(`BlazingMints`, 'https://media.discordapp.net/attachments/840649597604724747/916762396020862976/unknown_4.png')
                    .setTimestamp()
                hookk.send(embed)
            }
        });
        res.send(true)
    }
    else {
        res.send(false)
    }
})

app.get('/launchpad/drop_details/:key', (req, res) => {
    var license_key = req.params.key
    var data_to_send = JSON.parse(fs.readFileSync('./Launchpad_Drops.json').toString('utf-8'))
    const hookk = new Webhook(launchpad_drop_details_requested)
    const embed = new MessageBuilder()
        .setTitle('Launchpad Drop Details Requested')
        .addField('IP-Address:', `${req.ip}`)
        .addField('Key:', `${license_key}`)
        .setColor('#ff4747')
        .setThumbnail('https://media.discordapp.net/attachments/840649597604724747/916762396020862976/unknown_4.png')
        .setFooter(`BlazingMints`, 'https://media.discordapp.net/attachments/840649597604724747/916762396020862976/unknown_4.png')
        .setTimestamp()
    hookk.send(embed)
    res.send(data_to_send)
})

app.listen(port, () => {
  console.log(`[BLAZINGMINTS LAUNCHPAD API LISTENING ON PORT: ${port}]`)
})
