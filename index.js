const express = require("express");
const fs = require('fs')
const app = express();
const port = 3000;
app.use(express.json());

app.get('/' , (req,res) => {
    return res.json({
        success : 'true',
        msg : 'default route getting hit ...!'
    })
})

app.get("/sendData",(req,res)=>{
    const {userid  , latitude , longitude} = req.body;
    console.log("the incoming data is : " , req.body);
    fs.appendFile('./file.txt' ," " + Date.now() + " " + userid + " " + latitude + " " + longitude, (err)=>{
        console.log("the error is: " , err)
    } );

    console.log('file write part processed!');

    return res.json({
        success:true,
        msg:"Data stored in file.txt"
    })
})

function getData(){
    const data = fs.readFileSync('./file.txt' , 'utf-8')
    const values = data.split(' ');

    //i want to push data into an array
    let arr = [];
    //iterate in the string and store data in the array
    let i = 0;
    while(i<values.length){
        //extract the time at a index and its corrosponding coordinates
        let time = values[i];
        i++;
        let user = values[i];
        i++;
        let latitude = values[i];
        i++;
        let longitude = values[i];
        i++;
        arr.push({time , user , latitude , longitude});
    }

    return arr;
}

app.get('/getAllData' , (req,res) => {
    //fetch the data from the file
    let arr = getData();

    let result = []

    let i=0;
    while(i<arr.length){
        let j=i+1;
        let lat = arr[i].latitude;
        let long = arr[i].longitude;
        let endTimeRange = parseInt(arr[i].time) + 5000;
        while(j < arr.length && parseInt(arr[j].time) <= endTimeRange){
            console.log(i , j ,parseInt(arr[j].time)-parseInt(arr[i].time))
            if(arr[j].latitude===lat && arr[j].longitude === long){
                result.push({i ,j});
            }
            j++;
        }
        i++;
    }

    console.log('the processed all Data is : ' , result)
    
    return res.json({
        success : true,
        allData : arr,
        data : result
    })
})

app.get('/userSpecificDetails' , (req,res)=>{
    const userId = req.body.userId;

    console.log("the incoming user id is :" , userId);
    //fetch the data from the file
    let result = getData();

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
    console.log("Server running...")
})