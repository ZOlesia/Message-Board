var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const flash = require('express-flash');
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
var path = require('path');
var session = require('express-session');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'secretsessionkey',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}))

//Use native promises
mongoose.Promise = global.Promise;

//Connect to Mongoose to MongoDB - localhost/<name of database>
mongoose.connect('mongodb://localhost/dashboard');

//Create Mongoose Schema
var Schema = mongoose.Schema;

var messageSchema = Schema({
    message: { type: String, required:[true, "Message is required"]},
    user: { type: String, required:[true, "Name is required"]},
    comments_message: [{ 
        creator: { type: String, required:[true, "Name is required"]},
        comment: { type: String, required:[true, "Comment is required"]}
    }]
}, {timestamps: true });

// var commentSchema = Schema({
//     user: { type: String, required:[true, "Name is required"]},
//     comments: { type: String, required:[true, "Comment is required"]},
//     message: [{ type: Schema.Types.ObjectId, ref: 'Message'}]
// }, {timestamps: true });

var Message = mongoose.model('Message', messageSchema);
// var Comment = mongoose.model('Comment', commentSchema);

//Root Request 
app.get('/', function(req, res) {
    
    var display_all = Message.find({},function(err,result){
        if(err){
            console.log("error query");
        }
        else {
            console.log("***** From Index *****");
            console.log(result);
            res.render("index", {messages: result});
        }
    })
     
})

app.post('/wall', function(req, res){
    console.log("POST DATA", req.body);
    var wall = new Message({user: req.body.name, message: req.body.message});
    wall.save(function(err){
        if(err){
            console.log("***** From Wall *****");
            console.log("errors");
            res.redirect("/");
        } else {
          console.log('Successfully added an animal!');
          res.redirect('/');
        }
    })
})

app.post('/comments', function(req, res){
    // console.log("POST DATA", req.body);
     var new_comment = {creator:req.body.name, comment: req.body.comments};
    // console.log("####");
    // console.log(new_comment);

        Message.findByIdAndUpdate({_id:req.body.messageid},{$push: {comments_message: new_comment}},function(err, data){
        console.log("*********");
        console.log(req.body.messageid);
        if(err){
            console.log("***** From Comments-Error *****");
            console.log("errors");
            res.redirect("/");
        } else {
          console.log("***** From Comments *****");
          console.log(data);
          console.log('Successfully added an animal!');
          res.redirect('/');
        }
    })
})







//Setting our server to listen on port: 8000
app.listen(1337, function(){
    console.log("listening on port 1337");
})


