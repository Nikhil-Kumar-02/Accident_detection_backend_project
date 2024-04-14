const express = require("express");
const fs = require('fs')
const app = express();
const port = 10000;
require('dotenv').config();

const accountSid = process.env.accountSid;
const authToken = process.env.authToken;

const client = require('twilio')(accountSid, authToken);

app.use(express.json());

app.get('/' , (req,res) => {
    console.log('the parameter are : ' , req.query.latitude , req.query.longitude);
    return res.json({
        success : 'true',
        msg : 'default route getting hit ...!'
    })
})

app.post('/createEntry' , (req,res)=>{

    let wholeUserData;

    fs.readFile('./data.json' , 'utf-8' , function (err, data) {
        if (err)
            console.log("error while reading the data.json " , err);
        else{
            wholeUserData = JSON.parse(data);

            wholeUserData.push(req.body);
            const stringifiedData = JSON.stringify(wholeUserData);

            fs.writeFile('./data.json' ,stringifiedData, (err)=>{
                console.log("the error is: " , err)
            } );
        }
    })

    return res.json({
        success:true,
        msg:"Data stored in data.json"
    })
})

app.post("/alert", async (req,res)=>{
    console.log(req.body);
    let wholeUserData;

    fs.readFile('./file.json' , 'utf-8' , function (err, data) {
        if (err)
            console.log("error while reading the data.json " , err);
        else{
            wholeUserData = JSON.parse(data);

            let incomingData = req.body;
            incomingData.date = Date.now();

            wholeUserData.push(incomingData);

            const stringifiedData = JSON.stringify(wholeUserData);

            fs.writeFile('./file.json' ,stringifiedData, (err)=>{
                if(err){
                    console.log("the error is: " , err)
                }
            } );
        }
    })

    //this user might met with an accident so send message to the immediatery

    //first get the emergency contacts of this user
    let wholedata = fs.readFileSync('./data.json' , 'utf-8');
    wholedata = JSON.parse(wholedata);
    //filter out the user from it
    const userDetails = wholedata.filter((d) => d.userId === req.body.userId);
    
    const emergencyNumber = userDetails[0].emergencyNumber;
    
    //now send message to this number

    const result = await client.messages
        .create({
            body: `${req.body.msg}`,
            from: '+12514514608',
            to: `${emergencyNumber}`
        })
        .then(message => console.log(message.sid))

    return res.json({
        success:true,
        msg:"Data stored in file.json",
        emergencyNumber
    })
})


app.get('/getAllData' , (req,res) => {
    //fetch the data from the file
    let arr = fs.readFileSync('./file.json' , 'utf-8');

    arr = JSON.parse(arr);
    
    return res.json({
        success : true,
        allData : arr,
    })
})

app.get('/userSpecificDetails' , (req,res)=>{
    const userId = req.body.userId;

    console.log("the incoming user id is :" , userId);
    //fetch the data from the file
    let result = fs.readFileSync('./file.json' , 'utf-8')

    //now for this user last collision call find who was closest to his location
    let i = result.length - 1;

    let answer = [];

    while(i>=0){
        if(userId == result[i].user){
            // answer.push(result[i]);
            //check its 2s prev and forward
            const targetTime = parseInt(result[i].time);
            
            let index = i+1;
            while(index < result.length && targetTime+2000 < result[index].time){
                if(result[index].latitude === result[i].latitude 
                    && result[index].longitude === result[i].longitude){
                    answer.push(result[index]);
                }
                index++;
            }

            index = i-1;
            while(index >= 0 && targetTime-2000 < result[index].time){
                if(result[index].latitude === result[i].latitude 
                    && result[index].longitude === result[i].longitude){
                    answer.push(result[index]);
                }
                index--;
            }
            break;
        }
        i--;
    }

    console.log('respose for user : ' , answer);

    return res.json({
        success:true,
        data : answer
    })
})

app.listen(port,()=>{
    console.log("Server running..." , port)
})