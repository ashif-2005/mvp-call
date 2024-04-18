const express = require('express')
const db = require('mongoose')
const parser = require('body-parser')
const cors = require('cors')
const twilio = require('twilio');
const axios = require('axios');

const app = express()
app.use(parser.json())
app.use(cors())

const port = process.env.PORT || 8000
const accountSid = 'AC179885a79b99fc0706b56cf810ed731e';
const authToken = '11d966963c2a74b27ae018b486a57044';

app.post('/call',(req,res)=>{
    try{
        async function makeCallAndRecord(from, to, twimlUrl) {
            try {
                // Make a POST request to initiate a call
                const response = await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, 
                    `From=${from}&To=${to}&Url=${twimlUrl}&Record=true`, {
                    auth: {
                        username: accountSid,
                        password: authToken
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                // Check if the call was successfully initiated
                if (response.status === 201) {
                    console.log("Call initiated successfully. SID:", response.data.sid);
                    res.status(200).json({'status':'success','callSid':response.data.sid})
                } else {
                    console.log("Failed to initiate call. Status code:", response.status);
                    res.status(500).json({'status':'Some Internal Issue...','error':response.status})
                }
            } catch (error) {
                console.error("Error making call:", error);
            }
        }

        // Example usage: Replace placeholders with actual values
        const from = '+13343414014';
        const to = `+91${req.body.agentNumber}`;
        const twimlUrl = `https://calltrack.onrender.com/twiml/${req.body.clientNumber}`; // URL to TwiML document that handles the call

        console.log(twimlUrl)

        // Call the function to make a call and record it
        makeCallAndRecord(from, to, twimlUrl);

    }catch(error){
        res.status(400).json({'status':'error','error':error.message})
    }
})

app.listen(port,()=>{
    console.log(`Listening on port ${port}...`)
})
