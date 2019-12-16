const express = require("express");

const App = express();

App.get("/", function(req,res){
    res.send("Server is running");
})


App.listen(3000, function(){
    console.log("Back-end server is running on port 3000.")
});