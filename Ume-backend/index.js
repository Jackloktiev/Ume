const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const App = express();
App.use(bodyParser.urlencoded({extended:true}));

//---Set up Data Base---
mongoose.connect("mongodb://localhost:27017/UmeDB",{ useNewUrlParser: true,  useUnifiedTopology: true });

//--Define User collection--
const userShema = new mongoose.Schema ({
    username: String,
    name: String,
    password: String,
    gender: String,
    age:Number,
    height:Number,
    weight:Number,
    lvlOfActivity:String,
    consumption:Array,
    normCalories:Number,
    normFats:Number,
    normProteins:Number,
    normCarbs:Number
});
const User = mongoose.model("User", userShema);
//--Define collection of food and drinks--
const itemShema = new mongoose.Schema ({
    id:Number,
    category:String,
    restaurant:String,
    name:String,
    imageUrl:String,
    caloriesPer100g:Number,
    fatsPer100g:Number,
    carbsPer100g:Number,
    proteinsPer100g:Number
});
const Item = mongoose.model("Item",itemShema);


//---Define routes---
//--Home route--
App.get("/", function(req,res){
    res.send("Server is running");
})

//--Register new user route--
App.post("/newUser", function(req,res){
    const user = new User({
        username: req.body.username,
        name: req.body.name,
        password: req.body.password,
    })
    user.save(function(err){
        if(err){
            console.log(err);
            res.send("There has been an error");
        }else{
            console.log("new user added sucesfully!");
            res.send("New user added");
        }
    });
})

//--Add consumed item route--
App.post("/consumed", function(req,res){
    var meal = {
        date:req.body.date,
        calories:req.body.calories,
        fats:req.body.fats,
        carbs:req.body.carbs,
        proteins:req.body.proteins
    }
    User.updateOne({username:req.body.username},{$push:{consumption:meal}},function(err){
        if(err){
            console.log(err);
            res.send("Ooops!");
        }else{
            console.log("meal has been added")
            res.send("Yummy!");
        }
    });
})

//--Add route to record weight, age and other parameters and return norms for carbs, fats, proteins and calories--
App.patch("/userProfile", function(req,res){
    function proteinNorm (weight,activity){
        var norm = 0;
        if(activity==="low"){
            norm = parseFloat(weight);
        }else if(activity==="sport"){
            norm = parseFloat(weight)*1.6;
        }else{
            norm = parseFloat(weight)*1.3;
        }
        return norm;
    };

    function carbsNorm (weight,activity){
        var norm = 0;
        if(activity==="low"){
            norm = parseFloat(weight)*3;
        }else if(activity==="sport"){
            norm = parseFloat(weight)*5;
        }else{
            norm = parseFloat(weight)*6;
        }
        return norm;
    };
    function fatsNorm (weight){
        var norm = parseFloat(weight)*0.8;
        return norm;
    };

    function BMR (gender,weight,height,age){
        var BMR = 0;
        if(gender==="male"){
            BMR = (10*parseFloat(weight))+(6.25*parseFloat(height))-(5*parseFloat(age))+5;
            return BMR;
        }else if(gender==="female"){
            BMR = (10*parseFloat(weight))+(6.25*parseFloat(height))-(5*parseFloat(age))-161;
            return BMR;
        }else{
            return BMR = 0;
        }
    };

    function AMR(levelOfActivity){
        if(levelOfActivity==="low"){
            return 1.2;
        }else if(levelOfActivity==="moderate"){
            return 1.375;
        }else if(levelOfActivity==="average"){
            return 1.55;
        }else if(levelOfActivity==="high"){
            return 1.725;
        }else if(levelOfActivity==="sport"){
            return 1.9;
        }else{
            return 0;
        }
    };
    
    var userName = req.body.username;
    var userGender = req.body.gender;
    var userAge = req.body.age;
    var userHeight = req.body.height;
    var userWeight = req.body.weight;
    var userActivity = req.body.activity;
    var normCalories = BMR(req.body.gender,req.body.weight,req.body.height,req.body.age)*AMR(req.body.activity);
    var normFats = fatsNorm(req.body.weight);
    var normProteins = proteinNorm(req.body.weight, req.body.activity)
    var normCarbs = carbsNorm(req.body.weight, req.body.activity)

    
    User.updateOne({username:userName},{
        gender:userGender,
        age:userAge,
        height:userHeight,
        weight:userWeight,
        lvlOfActivity:userActivity,
        normCalories:normCalories,
        normFats:normFats,
        normProteins:normProteins,
        normCarbs:normCarbs
        },
        function(err){
            if(!err){
                res.send("User profile updated");
            }else{
                res.send(err);
            }
        }
    );
});

//--Add route to get norms for carbs, fats, proteins and calories--
App.get("/userProfile", function(req,res){
    User.findOne({username:req.body.username}, function(err,foundUser){
        if(err){
            res.send(err);
        }else{
            let userProfile = {
                age:foundUser.age,
                gender:foundUser.gender,
                height:foundUser.height,
                weight:foundUser.weight,
                lvlOfActivity:foundUser.lvlOfActivity,
                normFats:foundUser.normFats,
                normProteins:foundUser.normProteins,
                normCarbs:foundUser.normCarbs,
                normCalories:foundUser.normCalories
            }
            res.send(userProfile);
        }
    })           
});

//--Add new food item to the database--
App.post("/newFoodItem",function(req,res){
    var itemID = 0;
    var itemCategory = req.body.category;
    var itemRestaurant = req.body.restaurant;
    var itemName = req.body.name;
    var itemImageUrl = req.body.imageUrl;
    var itemCalories = req.body.calories;
    var itemFats = req.body.fats;
    var itemCarbs = req.body.carbs
    var itemProteins = req.body.proteins
        
    const foodItem = new Item ({
        id: itemID,
        category: itemCategory,
        restaurant: itemRestaurant,
        name: itemName,
        imageUrl: itemImageUrl,
        caloriesPer100g: itemCalories,
        fatsPer100g: itemFats,
        carbsPer100g: itemCarbs,
        proteinsPer100g: itemProteins
    })
    foodItem.save(function(err){
        if(err){
            console.log(err);
            res.send("Error on adding food item");
        }else{
            console.log("food item added sucesfully");
            res.send("Food item added sucesfully!");
        }
    });
})

//--get entire collection of food--
App.get("/getFood",function(req,res){

    Item.find({},function(err,foundItems){
        if(err){
            console.log(err);
            res.send(err);
        }else{
            res.send(foundItems);
        }
    });
});


App.listen(3000, function(){
    console.log("Back-end server is running on port 3000.")
});