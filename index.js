const express = require("express");
const fs = require('fs')
const app = express();
const port = 10000;
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

app.post("/sendData",(req,res)=>{

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
                console.log("the error is: " , err)
            } );
        }
    })

    return res.json({
        success:true,
        msg:"Data stored in file.json"
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