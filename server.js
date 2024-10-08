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
const accountSid = 'AC26c9f0625e74ab3d39a9de283b58407e';
const authToken = 'e08d245af7e07cc8294302fc245ec438';

app.post('/call',(req,res)=>{
    try{
        async function makeCallAndRecord(from, to, twimlUrl) {
            try {
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

        const from = '+19252353064';
        const to = `+91${req.body.agentNumber}`;
        const twimlUrl = `https://calltrack.onrender.com/twiml/${req.body.clientNumber}`;

        console.log(twimlUrl)

        makeCallAndRecord(from, to, twimlUrl);

    }catch(error){
        res.status(400).json({'status':'error','error':error.message})
    }
})

app.get('/getLog', async (req,res)=>{
    try {
        var data = [];
          let allCallLogs = [];
          let nextPageUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
  
          // Loop to fetch all pages of call logs
          while (nextPageUrl) {
              const response = await axios.get(nextPageUrl, {
                  auth: {
                      username: accountSid,
                      password: authToken
                  }
              });
  
              // Check if the request was successful
              if (response.status === 200) {
                  // Parse the JSON response
                  const callLogs = response.data;
                  allCallLogs = allCallLogs.concat(callLogs.calls);
  
                  // Check if there's a next page
                  nextPageUrl = callLogs.next_page_uri ? `https://api.twilio.com${callLogs.next_page_uri}` : null;
              } else {
                  console.log("Failed to retrieve call logs. Status code:", response.status);
                  break;
              }
          }
  
          // Print or process all call logs
          allCallLogs.forEach(call => {
            data.push({"Call SID":call.sid,"From":call.from,"To":call.to,"Duration":call.duration,"Status":call.status,"Date Time":call.date_created,"Direction":call.direction})
          });
          res.status(200).json({"data":data})
      } catch (error) {
          console.error("Error retrieving call logs:", error);
      }
})

app.get('/audio', (req, res) => {
    const audioFileUrl = 'https://api.twilio.com/2010-04-01/Accounts/AC179885a79b99fc0706b56cf810ed731e/Recordings/RE52e41f8fd94a0d6c37325f6a11668978.mp3'; // Replace with your audio file URL
    res.redirect(audioFileUrl); // Redirect the user to the audio file link
});

app.listen(port,()=>{
    console.log(`Listening on port ${port}...`)
})
