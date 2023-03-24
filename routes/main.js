module.exports = function(app, shopData) {
    const bcrypt = require('bcrypt');
    const request = require('request');
    const {check,validationResult} = require('express-validator');
    const redirectLogin = (req, res,next) => {
        if (!req.session.userId){
            //res.redirect('/login');//local developerment
            res.redirect('https://www.doc.gold.ac.uk/usr/228/login'); //deploy to gold server use this to fix errors
        }else{
            next();
        }
    }
    let id_identifiers; //store the id_identifiers
    // custom res.send with alert message then redirect to a page
    // delay timeout is 5000 milliseconds
    function alert(msg,url) { //pass message and url to redirect
        let alert = "<script>" + "alert('" + msg + "'); "+ //message
                    "setTimeout('', 5000); "+ //delay
                    //"window.location.href = '/"+ url +"';</script>"; //local developerment
                    "window.location.href = 'https://www.doc.gold.ac.uk/usr/228/"+ url +"';</script>"; //deploy to gold server use this to fix errors
        //console.log(alert);
        return alert; //return alert message
    }     
    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/search',redirectLogin,function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', redirectLogin,function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);

        //sanitize the input
        let keyword = req.sanitize(req.query.keyword);

        let sqlquery = "SELECT * FROM food WHERE name LIKE '%" + keyword + "%'"; // query database to get all the food
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) { //if error
                res.redirect('./'); //redirect to home page 
            }
            if (result.length == 0) { //if no result
                res.send(alert("No result found!","search")); //alert message and redirect to search page
            }else { //if there are results
                let newData = Object.assign({}, shopData, {availablefood:result}); //assign the result to the shopData
                console.log(newData) //log the result
                res.render("list.ejs", newData) //render the list.ejs page
            }
         });        
    });
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);   

    });                                                                                                 
    app.post('/registered', [check('username').isLength({min:6}).withMessage('Username is required minimum length of 6'),], // check username length
                            [check('first').isLength({min:1}).withMessage('Please enter your first name'),], // check first name length
                            [check('last').isLength({min:1}).withMessage('Please enter your last name'),], // check last name length
                            [check('password').isLength({min:8}).withMessage('Password must be at least 8 characters long'),], // check password length
                            [check('email').isEmail().withMessage('Please enter a valid email address'),], // check email format
                            function (req,res) {
        const errors = validationResult(req);//check for errors
        
        if (!errors.isEmpty()){ //if there are errors
            let msg = ""; //initialize message
            //grab param and msg and store as msg with \n
            for (var i = 0; i < errors.array().length; i++) { //loop through the errors
                msg +=errors.array()[i].msg+'\\n'; // update msg with error message
                //console.log(msg);
            }
            console.log(msg);// console log the errors
            res.send(alert(msg,"register"));// send helper message and redirect to register page
            } 


            //redirect to register page
            else {
                //sanitize the inputs
                let user = req.sanitize(req.body.username);
                let first = req.sanitize(req.body.first);
                let last = req.sanitize(req.body.last);
                let password = req.sanitize(req.body.password);
                let email = req.sanitize(req.body.email);
                
                //check if the username is already registered
                let sqlQueryDupsCheck = "SELECT * FROM users WHERE userName = '" + user + "' OR email = '" + email + "'"; 
                
                // execute sql query
                db.query(sqlQueryDupsCheck, (err, result) => {
                    if (result.length == 0) { //if no duplicates then begin registration
                        const saltRounds = 10; //salt rounds
                        const plainPassword = password; //plain password
                        const hash = ""; //initialize hash
                        bcrypt.hash(plainPassword, saltRounds, function(err, hash) { //hash the password
                            if (err) { //error handling
                                console.log(err); //log the error
                                res.redirect('./'); //redirect to home page
                            }
                            // saving data in database with sanitized inputs
                            let sqlquery = "INSERT INTO users (userName,firstName, lastName, password,email) VALUES ('" + user + "', '" 
                                                                                                                        + first+ "','" 
                                                                                                                        + last + "','" 
                                                                                                                        + hash + "','" 
                                                                                                                        + email + "')"; 
                            //console.log(sqlquery);

                            // execute sql query
                            db.query(sqlquery, (err, result) => {
                                if (err) { //error handling
                                    console.log("Error inserting into database"); //log the error
                                    res.redirect('./');//redirection to home page
                                }
                                console.log("New registered user info are inserted into database");//log the success
                                // message to be sent to the user
                                let msg = 'Hello '+ first + ' '+ last +' you are now registered! We will send an email to you at ' + email + '.';
                                //debug password check
                                //msg += ' Your password is: '+ req.body.password +' and your hashed password is: '+ hash;
                                res.send(alert(msg,"login"));//send helper message and redirect to login page
                                });  
                            });  
                        }else{ //username or email already registered
                            console.log("User or Email already exists"); //log the error
                            let msg = 'Username or email already exists, please enter a valid username and email address.'; //message to be sent to the user
                            res.send(alert(msg,"register")); //send helper message and redirect to register page
                        } 
                    });
        }
    }); 
    app.get('/list', function(req, res) {
        let sqlquery = "SELECT * FROM food"; // query database to get all the food
        // execute sql query
        db.query(sqlquery, (err, result) => { 
            if (err) { // error handling
                res.redirect('./'); // redirect to home page
            }
            let newData = Object.assign({}, shopData, {availablefood:result}); // create new object with the data from the database
            console.log(newData) // console log the data for debugging
            res.render("list.ejs", newData) // render the list page with the data
         });
    });
    app.get('/listusers', redirectLogin,function(req, res) {
        let sqlquery = "SELECT userName FROM users"; // query database to get all the users
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) { // error handling
                console.log("Error getting users from database"); //log the error
                res.redirect('./'); // redirect to home page
            }
            let newData = Object.assign({}, shopData, {listUsers:result}); // create new object with the data from the database
            console.log(newData) // render the list page with the data
            res.render("listusers.ejs", newData) // render the listusers page with the data
         });
    });
    app.get('/addfood', redirectLogin,function (req, res) {
        res.render('addfood.ejs', shopData); // render the addfood page
    });
    app.post('/foodadded',redirectLogin, function (req,res) {
        //sanitize the inputs
        let name = req.sanitize(req.body.name);
        let typicalValuePer = req.sanitize(req.body.typicalValuePer);
        let unitOfTheTypeValue = req.sanitize(req.body.unitOfTheTypeValue);
        let carbs = req.sanitize(req.body.carbs);
        let fat = req.sanitize(req.body.fat);
        let protein = req.sanitize(req.body.protein);
        let salt = req.sanitize(req.body.salt);
        let sugar = req.sanitize(req.body.sugar);
        //get username from session
        let associatedUser = req.session.userId;
        console.log(associatedUser);

        //check if the food is already registered
        let sqlQueryDupsCheck = "SELECT * FROM food WHERE name = '" + name + "'";
        // execute sql query
        db.query(sqlQueryDupsCheck , (err, result) => {
            if (err){
                console.log("Database Error: " + err); //log the error
                res.send("Database error returning last page","addfood");//redirection to home page
            }
            if (result.length == 0) { //if no duplicates then begin registration
                /////////////////////////////
                // saving data in database //
                /////////////////////////////
                let sqlquery = "INSERT INTO food (name,typicalValuePer,unitOfTheTypeValue,carbs,fat,protein,salt,sugar,associatedUser) VALUES (?,?,?,?,?,?,?,?,?)";
                // execute sql query
                let newrecord = [name, typicalValuePer,unitOfTheTypeValue,carbs,fat,protein,salt,sugar,associatedUser];
                db.query(sqlquery, newrecord, (err, result) => {
                if (err) {// error handling
                    console.error(err.message);// error handling
                    res.send(alert("Error, Make sure you entered valid details","addfood"));// send helper message and redirect to addfood page
                }
                else{// success
                    //console.log("New food info are inserted into database");
                    let msg = ' This food is added to database, name: '+ name + '';// message to be sent to the user
                    res.send(alert(msg,"list"));// send helper message and redirect to list page
                }});
            }else{//food already registered
                console.log("Food already exists"); //log the error
                let msg = 'Food already exists, please enter a valid food name.'; //message to be sent to the user
                res.send(alert(msg,"addfood")); //send helper message and redirect to addfood page
            }
        });
    });
    app.get('/login', function (req, res) {
        //check if user is already logged in
        if (!req.session.userId){ //not logged in
            res.render('login.ejs', shopData);// render the login page
        }else{//already logged in
            let msg = "You are already logged in!";// message to be sent to the user
            res.send(alert(msg,""));// send helper message and redirect to home page
        }

    });
    app.post('/loggedin', function (req, res) {
        //sanitize the inputs
        let user = req.sanitize(req.body.username);
        let password = req.sanitize(req.body.password);

        //check for empty fields
        if (user == "" || password == "") { //if there are empty fields
            console.log("Empty fields"); //log the error
            let msg = 'Please enter a valid username and password.'; //message to be sent to the user
            res.send(alert(msg,"login")); //send helper message and redirect to login page
        }
        //if there are no empty fields then continue
        else { 
            let sqlquery = "SELECT * FROM users WHERE userName = '" + user + "'"; 
            //debug check
            //console.log("input username = " + req.body.username);
            //console.log("input password = " + req.body.password);

            //execute sql query
            db.query(sqlquery, (err, result) => {
                if (err) { //error handling
                    let msg= "server error, database not connected"; //message to be sent to the user
                    console.log(msg); //log the error
                    res.send(alert(msg,"login")); //send helper message and redirect to login page
                }else{
                    if (result.length == 0) { //if the username is not found
                        let msg="Please enter a valid username and password"; //message to be sent to the user
                        console.log(msg); //log the error
                        res.send(alert(msg,"./login")); //send helper message and redirect to login page
                    }else{
                        const hashedPassword = (Object.values(result[0])[4]);
                        //use bcrypt to compare the password with the hashed password in the database
                        bcrypt.compare(password, hashedPassword, function(err, result1) {
                            if (err) {
                                // TODO: Handle error
                                console.log(err);
                                res.send(alert("bcrypt Error, please try again","login"));
                                }
                                else if (result1 == true) {
                                // TODO: Send message
                                    console.log(Object.values(result[0])[2] + " is logged in at" + Date());// use, date and time of login
                                    //save user session , when login is successful
                                    req.session.userId = req.body.username;
                                    console.log(req.session.userId);
                                    let welcomeMessage = 'Hello '+ req.body.username + ' you are now logged in!';//message to be sent to the user
                                    res.send(alert(welcomeMessage,""));// send helper message and redirect to home page
                                }
                                else {
                                // TODO: Send message
                                    let msg = "Username or passowrd do not match";
                                    res.send(alert(msg,"login"));
                                }
                        });
                    }
                }
            });
        }


    });
    app.get('/usersOwnList', redirectLogin,function(req, res) {
        let user = req.session.userId;
        let sqlquery = "SELECT * FROM food WHERE associatedUser = '" + user + "'"; // query to get the data from the database
        db.query(sqlquery, (err, result) => {
          if (err) { // error handling
             res.redirect('./'); // redirect to home page
          }
          let newData = Object.assign({}, shopData, {availablefood:result}); // create new object with the data from the database
          console.log(newData) // console.log the data for debugging
          res.render("list.ejs", newData)// render the bargains page with the data
        });
    });  
    app.get('/deleteuser', redirectLogin,function (req, res) {
        res.render('deleteuser.ejs', shopData);
    });
    app.post('/userdeleted', function (req, res) {
        //sanitize the input
        let user = req.sanitize(req.body.username);
        let sqlquery = "DELETE FROM users WHERE userName = '" + user + "'"; 
        //execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) { //error handling
                console.log("Error deleting user from database");//log the error
                res.redirect('./'); // redirect to home page
            }else{//if the username is not found
                if (result.affectedRows == 0) { 
                    console.log("Delete user does not exist"); //log the error
                    let msg = 'Please enter a valid username, '+ user+' does not exist';//message to be sent to the user
                    res.send(alert(msg,"deleteuser"));//redirect to home page and send helper message
                }else{//success
                    let msg = "User: "+ user+" is deleted";// message to be sent to the user
                    console.log(msg);//log the success
                    res.send(alert(msg,"listusers"));//send helper message and redirect to listusers page
                }
            }
        });
    });
    app.get('/logout', redirectLogin,function (req, res) { 
        req.session.destroy(err => {
            if (err) { // error handling
                return res.redirect('./')// redirect to home page
            }
            //successfully logged out
            let msg = "You are logged out";// message to be sent to the user
            console.log (msg);//log the success
            res.send(alert(msg,"")); //send helper message and redirect to home page
        })
    });
    //add an api call and a search function to find foods from the database
    app.get('/api',function (req, res) {
        //store parameters from for easy access
        let remove = req.sanitize(req.query.remove); //get the delete from the request parameters
        let search = req.sanitize(req.query.search); //get the search from the request parameters
        let token = req.sanitize(req.query.token); //get the token from the request parameters

        let update = req.sanitize(req.query.update); //get the update from the request parameters
            let foodElement = req.sanitize(req.query.old); //get the field from the request parameters
            let newValue = req.sanitize(req.query.new); //get the new from the request parameters

        //console.log all the parameters for debugging
        console.log("token = " + token);
        console.log("update = " + update);
        console.log("remove = " + remove);
        console.log("search = " + search);
        if (token != undefined ) {//only proceed if token is specified and continue for the rest of the code for verification and more
            //check if token is valid and if it is then continue
            let sqlquery = "SELECT * FROM users where apiToken = '" + token + "'"; // query database to get all the food
            // execute sql query
            db.query(sqlquery,(err, result) => {
                if (err) { //if error
                    let error = { "error": "Server Error" }; //create error message
                    res.send(error); //send error message
                }else{
                    if (result.length == 0) { //if the username is not found
                        //return json error message
                        let error = { "error": "Please enter a valid token" }; //create error message
                        res.send(error); //send error message
                    }else{
                        //store username in a variable for later access control arguments
                        let username = Object.values(result[0])[1];
                        console.log(username); //log the username for debugging
                        // if no further request parameters are specified then return all the food
                        if (update == undefined && remove == undefined && search == undefined) {
                            let sqlquery = "SELECT * FROM food"; // query database to get all the food
                            // execute sql query
                            db.query(sqlquery,(err, result) => {
                                if (err) { //if error
                                    let error = { "error": "Server Error" };
                                    res.send(error);//send the error message
                                }else{
                                    res.send(result); //send the result
                                }
                            });
                        }else{
                            //only take a arguments if they are specified and not multiple
                            if (remove !== undefined && update == undefined && search == undefined) { //if only remove is specified
                                //check if food exists in the database
                                let sqlquery = "SELECT * FROM food where name = '" + remove + "'"; // query database to check if food exists
                                // execute sql query
                                db.query(sqlquery,(err, result) => { //execute the query
                                    if (err) { //
                                        let error = { "error": "Server Error" }; //create error message
                                        res.send(error); //send the error message
                                    }
                                    if (result.length == 0) { //if the food is not found
                                        let error = { "error": "Food not found" }; //the error message
                                        res.send(error); //send the error message
                                    }else{
                                        //store associatedUser in a variable to compare with the username
                                        let associatedUser = Object.values(result[0])[9];
                                        console.log(associatedUser); //debug console log
                                        //compare the username with the associatedUser
                                        if (username == associatedUser) {
                                            let sqlquery = "DELETE FROM food WHERE name = '" + remove + "'"; // query database to delete food
                                            // execute sql query
                                            db.query(sqlquery,(err, result) => { //execute the query
                                                if (err) { //if error
                                                    let error = { "error": "Server Error" }; //display the error
                                                    res.send(error); //send the error message
                                                }else{
                                                    let success = { "success": "Food deleted" }; //display the success message
                                                    res.send(success); //send the success message
                                                }
                                            });
                                        }else{
                                            let error = { "error": "You are not authorized to delete this food" }; //display the error
                                            res.send(error); //send the error message
                                        }
                                    }
                                });
                            }
                            if (update !== undefined && remove == undefined && search == undefined) { //if only update is specified
                                // further check for parameters
                                if (foodElement !== undefined && newValue !== undefined) { //if all the parameters are specified
                                //check if food exists in the database
                                let sqlquery = "SELECT * FROM food where name = '" + update + "'"; // query database to check if food exists
                                // execute sql query
                                db.query(sqlquery,(err, result) => {
                                    if (err) { // error handling
                                        let error = { "error": "Server Error" };
                                        res.send(error);
                                    }else{
                                        if (result.length == 0) { //if the food is not found
                                            let error = { "error": "Food not found" }; //the error message
                                            res.send(error); //send the error message
                                        }else{
                                            //compare the username with the associatedUser
                                            let associatedUser = Object.values(result[0])[9];
                                            console.log(associatedUser); //debug console log
                                            if (username == associatedUser) { //if the username matches the associatedUser
                                                //debug console
                                                console.log("field = " + foodElement);
                                                console.log("newValue = " + newValue);
                                                // update food table, set field to new value where food name is defined by the user
                                                let sqlquery =  "update food "+ //update the food table
                                                                "set " + foodElement + " = '" + newValue + //set the food's element to the new value
                                                                "' where name = '" + update + "'";  //where the food name is defined by the user
                                                // execute sql query
                                                db.query(sqlquery,(err,result) => {
                                                    if (err) { //if error
                                                        let error = { "error": "Server Error" };
                                                        res.send(error); //send the error message
                                                    }else{ //if success response
                                                        let success = { "success": "Food updated" };
                                                        res.send(success); //send the success message
                                                    }
                                                });
                                            }else{
                                                let error = { "error": "You are not authorized to update this food" }; //display the error
                                                res.send(error); //send the error message
                                            }
                                        }
                                    }
                                });
                                } else {//if arguments not provided
                                    let error = { "error": "Please check the arguments" }; //display the error
                                    res.send(error); //send the error message
                                }
                            }
                            if (search !== undefined && remove == undefined && update == undefined) { // if only search is specified
                                //search for food in the database with name defined by the user
                                let sqlquery = "SELECT * FROM food where name = '" + search + "'"; // query database to check if food exists
                                // execute sql query
                                db.query(sqlquery,(err, result) => {
                                    if (err) { // error handling
                                        let error = { "error": "Server Error" };
                                        res.send(error); //send the error message
                                    }else{ //empty result
                                        if (result.length == 0) { //if the food is not found
                                            let error = { "error": "Food not found" }; //the error message
                                            res.send(error); //send the error message
                                        }else{ //success response
                                            res.send(result); //send the result message
                                        }
                                    }
                                });
                            }

                        }
                    }
                }
            });
        }else { // no api key provided
            console.log(token); //debug console log
            let error = { "error": "Please enter a token" };
            res.send(error); //send the error message
        }
    });
    //update food call
    app.get('/updateFood', redirectLogin,function (req, res) {
        res.render('updateFood.ejs', shopData);
    });
    //ouput the result of the search call
    app.get('/updateFoodSearchResult', redirectLogin,function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);

        //sanitize the input
        let keyword = req.sanitize(req.query.keyword); //get the keyword from the request parameters

        let sqlquery = "SELECT * FROM food WHERE name LIKE '%" + keyword + "%'"; // query database to get all the food
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) { //if error
                res.redirect('./'); //redirect to home page 
            }

            if (result.length == 0) { //if the food is not found
                console.log("Food does not exist"); //log the error
                let msg = 'Please enter a valid food name, searched food does not exist';//message to be sent to the user
                res.send(alert(msg,"updateFood"));//redirect to home page and send helper message
            }else{//success
                let newData = Object.assign({}, shopData, {availablefood:result}); //assign the result to the shopData
                id_identifiers = newData; // assign the result to the id_identifiers for global delete usage
                console.log(newData) //log the result
                res.render("foodEditor.ejs", newData) //render the list.ejs page
            }
         });        
    });
    //update food call
    app.post('/foodupdated', redirectLogin,function (req, res) {
        //sanitize the inputs
        let idNumber = req.sanitize(req.body.id); //get the id of the food to be updated
        let name = req.sanitize(req.body.name); //get the name of the food to be updated
        let typicalValuePer = req.sanitize(req.body.typicalValuePer); //get the typicalValuePer of the food to be updated
        let unitOfTheTypeValue = req.sanitize(req.body.unitOfTheTypeValue); //get the unitOfTheTypeValue of the food to be updated
        let carbs = req.sanitize(req.body.carbs); //get the carbs of the food to be updated
        let fat = req.sanitize(req.body.fat); //get the fat of the food to be updated
        let protein = req.sanitize(req.body.protein); //get the protein of the food to be updated
        let salt = req.sanitize(req.body.salt); //get the salt of the food to be updated
        let sugar = req.sanitize(req.body.sugar); //get the sugar of the food to be updated
        let owner = req.sanitize(req.body.owner); //get the owner of the food to be updated
        //get username from session as a identifier to be stored in database as the associated user
        let associatedUser = req.session.userId;

        console.log("updater: " + associatedUser);
        console.log("owner: " + owner);
        if (associatedUser != owner){
            let msg = "You are not the owner of this food, you cannot update it";// message to be sent to the user
            res.send(alert(msg,"updateFood"));//redirect to home page and send helper message
        }else{
            //debugging console.log
            // console.log("idNumber: " + idNumber);
            // console.log("name: " + name);
            // console.log("typicalValuePer: " + typicalValuePer);
            // console.log("unitOfTheTypeValue: " + unitOfTheTypeValue);
            // console.log("carbs: " + carbs);
            // console.log("fat: " + fat);
            // console.log("protein: " + protein);
            // console.log("salt: " + salt);
            // console.log("sugar: " + sugar);
            // console.log("associatedUser: " + associatedUser);
            //create sql query
            let sqlquery =  "UPDATE food "+//update the food table
                            "SET name = '" + name + // set the name to the new name
                            "', typicalValuePer = '" + typicalValuePer +  // set the typicalValuePer to the new typicalValuePer
                            "', unitOfTheTypeValue = '" + unitOfTheTypeValue +  // set the unitOfTheTypeValue to the new unitOfTheTypeValue
                            "', carbs = '" + carbs + "', fat = '" + fat +  // set the carbs to the new carbs and set the fat to the new fat
                            "', protein = '" + protein +  // set the protein to the new protein
                            "', salt = '" + salt +  // set the salt to the new salt
                            "', sugar = '" + sugar +  // set the sugar to the new sugar
                            "', associatedUser = '" + associatedUser +  // set the associatedUser to the new associatedUser
                            "' WHERE id = '" + idNumber + "'"; // all update based on the id number(id is what defines the food in the database, which can not be changed if the food element updates)
            
            console.log(sqlquery);
            //execute sql query
            db.query(sqlquery, (err, result) => {
                if (err) { //error handling
                    let msg = "Error updating food from database";// message to be sent to the user
                    console.log(msg);//log the error
                    res.send(alert(msg,"updateFood"))////send helper message and redirect to home page
                }else{//success
                    let msg = "Food updated successfully";// message to be sent to the user
                    console.log(msg);//log the success
                    //alrt and redirect to food list page
                    res.send(alert(msg,"list")); //send helper message and redirect to home page
                }
            });
        }
    });
    //delete food post call
    app.post('/deletefood',redirectLogin,function (req, res) {
        let owner = req.sanitize(req.body.owner);
        //get username from session as a identifier to be stored in database as the associated user
        let associatedUser = req.session.userId;
        if (associatedUser != owner){
            let msg = "You are not the owner of this food, you cannot update it";// message to be sent to the user
            res.send(alert(msg,"updateFood"));//redirect to home page and send helper message
        }else {
            let idNumber = req.sanitize(req.body.id);// retrieve the id number from the request
            let sqlquery = "DELETE FROM food WHERE id = '" + idNumber + "'"; // query to delete the asscoiated food with id number
            // execute sql query
            db.query(sqlquery, function (err, result) {
                if (err) { //error handling
                    let msg = "Error deleting food from database";// message to be sent to the user
                    console.log(msg);//log the error
                    res.send(alert(msg,"list"));//send helper message and redirect to home page
                }else{//success
                    let msg = "Food deleted successfully";// message to be sent to the user
                    console.log(msg);//log the success
                    res.send(alert(msg,"list"));//send helper message and redirect to home page
                }
            });
        }
    });
    //delete all the food in bodyclass = "result" the database
    app.post('/deleteAllFood',redirectLogin,function (req, res) {
        let user = req.sanitize(req.session.userId); // retrieve the user from the session
        let idNumber=""; //variable to store the id number
        let notOwned = ""; //variable to store the name of the food that is not owned by the user
        let deletedFood = ""; //variable to store the name of the food that is deleted
        //get all the id from identifier object
        for (let i = 0; i < id_identifiers.availablefood.length; i++) { //loop through the identifier object
            idNumber = id_identifiers.availablefood[i].id; //get the id number from the identifier object to be used in the sql query
            owner = id_identifiers.availablefood[i].associatedUser; //get the associated user from the identifier object to be used in the sql query
            name = id_identifiers.availablefood[i].name; //get the name from the identifier object to be used in the sql query
            //only excute mysql user and owner is the same
            if (user == owner){ //if the user is the owner of the food, then delete the food
                deletedFood += name + ", "; //add the name of the food to the deletedFood string to be displayed to the user later
                let sqlquery = "DELETE FROM food WHERE id = '" + idNumber + "'"; // query to delete the asscoiated food with id number
                // execute sql query
                db.query(sqlquery, function (err, result) {
                    if (err) { //if during the loop there is an error, then stop the loop and send the user a message immediately and stop the loop
                        let msg = "Error deleting food from database";// message to be sent to the user
                        console.log(msg);//log the error
                        res.send(alert(msg,"list"));//send helper message and redirect to home page
                    }
                });
            }else {// else add the food name to notOwned string to be displayed to the user later
                notOwned += name + ", ";// add the food name to notOwned string to be displayed to the user later
            }
        }

        id_identifiers = {};//rest id_identifiers to empty object

        ////////////////////////////////////////////////////////////////
        //section for displaying the message to the user and redirect///
        //if notOwned is empty, then all food deleted successfully/////
        if (notOwned ==""){            
            let msg = "All food selected deleted successfully: " + deletedFood;// message to be sent to the user with food thats deleted
            res.send(alert(msg,"list"));//send helper message and redirect to home page
        }else {//else some food not deleted with two different handling cases
            if (deletedFood !=""){
                let msg = "Some food selected deleted successfully: " + deletedFood + " but the following food was not deleted because you are not the owner: " + notOwned;// message to be sent to the user with food thats deleted
                res.send(alert(msg,"list"));//send helper message and redirect to home page
            }else {
                let msg = "The following food was not deleted because you are not the owner: " + notOwned;// message to be sent to the user with food thats deleted
                res.send(alert(msg,"list"));//send helper message and redirect to home page
            }
     }

       
    });
    //api documentation page for key generated or get existing key
    app.get('/generateAPI',redirectLogin,function (req, res) {
        res.render('genrateAPI',shopData);
    });
    //generate access token
    app.post('/generateAPIKey',redirectLogin,function (req, res) {
        let username = req.sanitize(req.session.userId); // retrieve username from session to be used in the sql query
        //function to generate a token 16 characters long with upper and lower case letters and numbers
        function generateToken(length) {
            var result = ''; //empty string to store the generated token
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; //characters to be used in the token
            var charactersLength = characters.length; //length of characters
            for ( var i = 0; i < length; i++ ) { //for each character in the token string
                result += characters.charAt(Math.floor(Math.random() * charactersLength)); //generate a random character from the characters string and add it to the result string
            }
            return result;//return the generated token
        }
        // store the generated token in a variable
        let token = generateToken(16); 
        // query to update the api token in the database
        let sqlquery = "update users set apiToken = '" + token + "' where username = '" + username + "'"; 
        // execute sql query
        db.query(sqlquery, function (err,result){
            if (err){
                let msg = "Error set api key";// message to be sent to the user
                console.log(msg);//log the error
                res.send(alert(msg,"generateAPI"));//send helper message and redirect to home page
            }
            else {
                let msg = "API key generated successfully, Please make a note of your API key: " + token;// message to be sent to the user
                console.log(msg);//log the success
                res.send(alert(msg,"generateAPI"));//send helper message and redirect to home page
            }
        });
    });
    //calculate food
    app.post('/calculateFood',function (req, res) {
        //get body id = sum and use to covert to arrat then query the database to retrieve the food data for sum calculation
        let food = req.sanitize(req.body.sum);
        console.log(food);
        //convert to array
        let foodArray = food.split(",");
        console.log("foodArray: " + foodArray[0]); //debug console.log
        if (foodArray.length >0){ //only excute mysql if foodArray is not empty
            //query to get all the food from foodArray size times
            let sqlquery = "SELECT * FROM food WHERE id IN (" + foodArray.map(function(){return '?';}).join(',') + ")";
            //execute sql query
            db.query(sqlquery,foodArray,function (err,result){
                if (err){
                    let msg = "Error getting food from database";// message to be sent to the user
                    console.log(msg);//log the error
                    res.send(alert(msg,"list"));//send helper message and redirect to home page
                }
                else {
                    console.log(result);
                    //create a sum object to hold the result
                    let sum = {
                        id: "",
                        name: "Summary",
                        carbs: 0,
                        fat: 0,
                        protein: 0,
                        salt: 0,
                        sugar: 0
                    };
                    for (let i = 0; i < result.length; i++) { //loop through the result and add the values to the sum object
                        sum.id += result[i].id + ","; //add the id to the id string,keep track of the id of the food
                        sum.carbs += result[i].carbs; //add the carbs to the carbs sum
                        sum.fat += result[i].fat; //add the fat to the fat sum
                        sum.protein += result[i].protein; //add the protein to the protein sum
                        sum.salt += result[i].salt; //add the salt to the salt sum
                        sum.sugar += result[i].sugar; //add the sugar to the sugar sum
                    }
                    //add sum to result
                    result.push(sum);//push the sum object to the result array
                    //assign new data  with result and sum
                    let newData = Object.assign({}, shopData, {availablefood:result}); //assign the result to the shopData
                    let msg = "Food calculated successfully";// message to be sent to the user
                    //send the food along with sum as a object
                    res.render('calculateResult',newData);//render the calculate page with the new data
            }
        });
        }else {
            let msg = "No food selected";// message to be sent to the user
            console.log(msg);//log the success
            res.send(alert(msg,"calculate"));//send helper message and redirect to home page
        }
    });

}
