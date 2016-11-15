var express = require('express');
var  http = require('http');
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], keyspace: 'alltotal'});
client.connect(function (err) {
    if(err)
        console.log('Connection error: '+err);
});


/* setting static html to be used*/
var app = express().use(express.static('public'));

//useful functions
var counter=1;
client.on('log', function(level, message, furtherInfo) {
    console.log('log event: %s -- %j -- %j', level, message, furtherInfo);
});
/* Route Definations */
app.get('/showusers',function(req,res){
  client.execute("SELECT id,firstname,lastname,email FROM users", function (err, result) {
           if (!err){
                   counter=result.rows.length+1;
                   res.json(result.rows);
                } else {
                   console.log("No results");
                   res.end();
               }
           
         });
});

app.get('/addUser',function(req,res){
    var firstname=req.query.firstname;
    var lastname=req.query.lastname;
    var email=req.query.email;
    client.execute("insert into users(id,firstname,lastname,email) values("+counter+",'"+firstname+"','"+lastname+"','"+email+"')",
      function(err,result){
      if(err){
        var error=[{'error':true}];
        res.json(error);
      }else{
        var resultt=[{'error':false}];
        res.json(resultt);
      }
    });
});
app.get('/deleteUser',function(req,res){
    var id=req.param('id');
    client.execute("delete from users where id="+id,function(err,result){
      if(err){
        var error=[{'error':true}];
        res.json(error);
      }else{
        var resultt=[{'error':false}];
        res.json(resultt);
      }
    })
});
app.get('/editUser',function(req,res){
    var id=req.param('id');
    var firstname=req.param('firstname');
    var lastname=req.param('lastname');
    var email=req.param('email');
    client.execute("update users set firstname='"+firstname+"',lastname='"+lastname+"',email='"+email+"' where id="+id+"",
      function(err,result){
      if(err){
        var error=[{'error':true}];
        res.json(err);
      }else{
        var resultt=[{'error':false}];
        res.json(resultt);
      }
    });
});

app.get('/*', function  (req, res) {
  res.status(404, {status: 'not found'});
  res.end();
});

app.listen(3000, function(){
  console.log("Server ready at http://localhost:3000");
});
