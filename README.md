I have implemented all the requirement, please check details if there is a extension.

R1: Home page:

    R1A: Display the name of the web application.
    index.ejs -- line 4

    R1B:  Display links to other pages or a navigation bar that contains links to other pages.
    index.ejs -- line 10-21

R2: About page: 

    R2A: Display information about the web application including your name as the developer. Display a link to the home page or a navigation bar that contains links to other pages.
    about.ejs


R3: Register page:

    R3A: Display a form to users to add a new user to the database. The form should consist of the following items: first name, last name, email address, username, and password.  Display a link to the home page or a navigation bar that contains links to other pages.
    register.ejs 

    R3B:  Collect form data to be passed to the back-end (database) and store user data in the database. Each user data consists of the following fields: first name, last name, email address, username and password. To provide security of data in storage, a hashed password should only be saved in the database, not a plain password.
    /routes/main.js -- line 60 onwards winthin registered

    R3C: Display a message indicating that add operation has been done.
    /routes/main.js -- line 112 onwards within registered 



R4: Login page:

    R4A: Display a form to users to log in to the dynamic web application. The form should consist of the following items: username and password.  Display a link to the home page or a navigation bar that contains links to other pages.
    login.ejs 

    R4B: Collect form data to be checked against data stored for each registered user in the database. Users are logged in if and only if both username and password are correct. 
    /routes/main.js -- line 217 onwards within loggedin 

    R4C: Display a message indicating whether login is successful or not and why not successful.
    /routes/main.js -- line 255 onwards within loggedin

R5: Logout
   
    There is a way to logout, a message is displayed upon successful logout.
    /routes/main.js -- line 314 onwards within logout

R6: Add food page (only available to logged-in users):

    R6A: Display a form to users to add a new food item to the database. 
    addfood.ejs

    Here is an example of a food item, showing the fields that should be on the form and example values:

    Name: flour
    Typical values per:100
    Unit of the typical value: gram
    Carbs: 81 g
    Fat: 1.4 g
    Protein: 9.1 g
    Salt: 0.01 g
    Sugar: 0.6 g

    This is saying that 100 grams of flour has 81g carbs, 1.4g fats, etc.  The unit of the typical value could also be things like litre, tablespoon, cup, etc.

    Display a link to the home page or a navigation bar that contains links to other pages.
    addfood.ejs 

    R6B:  Collect form data to be passed to the back-end (database) and store food items in the database. 
    /routes/main.js -- line 161 onwards within foodadded where I sanitize the inputs

    Going beyond by saving the username of the user who has added this food item to the database.
    /routes/main.js -- line 161 onwards within foodadded where I store the username from the session in to the database.

    R6C: Display a message indicating that add operation has been done.
    /routes/main.js -- line 161 onwards within foodadded

R7: Search food page 

    R7A: Display a form to users to search for a food item in the database. 'The form should contain just one field - to input the name of the food item'. Display a link to the home page or a navigation bar that contains links to other pages.
    search.ejs

    R7B:  Collect form data to be passed to the back-end (database) and search the database based on the food name collected from the form. If food found, display a template file (ejs, pug, etc) including data related to the food found in the database to users. Display a message to the user, if not found.
    /routes/main.js -- line 34 onwards within search-result


    R7C: Going beyond, search food items containing part of the food name as well as the whole food name. As an example, when searching for ‘bread’ display data related to ‘pitta bread’, ‘white bread’, ‘wholemeal bread’, and so on.
    /routes/main.js -- line 34 onwards within search-result where I use the like % argument within mysql query.

R8: Update food page (only available to logged-in users)

    R8A: Display search food form. Display a link to the home page or a navigation bar that contains links to other pages.
    updateFood.ejs

    R8B: If food found, display all data related to the food found in the database to users in forms so users can update each field. Display a message to the user if not found. Collect form data to be passed to the back-end (database) and store updated food items in the database. Display a message indicating the update operation has been done. You can go beyond this requirement by letting ONLY the user who created the same food item update it.
    /routes/main.js -- line 490 onwards within updateFoodSearchResult where search results will be rendered in foodEditor.ejs . The user can update, delete one & delete all the shown result. 

    R8C: Implement a delete button to delete the whole record, when the delete button is pressed, it is good practice to ask 'Are you sure?' and then delete the food item from the database, and display a message indicating the delete has been done. You can go beyond this requirement by letting ONLY the user who created the same food item delete it.
    foodEditor.ejs & 
    /routes/main.js -- line 517 onwards within foodupdated
    /routes/main.js -- line 578 onward within deletefood for single delete
    /routes/main.js -- line 603 onward within deleteAllFood to delete all the shown food result at once 
    All with double check confirm before procedure is executed

R9: List food page (available to all users) 

    R9A: Display all fields for all foods stored in the database. Display a link to the home page or a navigation bar that contains links to other pages.
    list.ejs

    R9B: You can gain more marks for your list page is organised in a tabular format instead of a simple list.
    list.ejs

    R9C: going beyond by letting users select some food items (e.g. by displaying a checkbox next to each food item and letting the user input the amount of each food item in the recipe e.g. 2x100 g flour). Then collect the name of all selected foods and calculate the sum of the nutritional information related to all selected food items for a recipe or a meal and display them as ‘nutritional information of a recipe or a meal’. Please note, it is not necessary to store recipes or meals in the database. 
    /route/main.js -- line 686 onwards within calculateFood

    -- I have implemented check box with multiple sum but with only one instance of each food item. The user can select as many items and pass to the server to calculate the sum then render to calculateResult.ejs page. Please tell me how as a feedback please!
    
    I was not able to find away to have 2 of the same instance of the food to sum. e.g. sum 2 flours

R10: API

    There is a basic API displayed on '/api' route listing all foods stored in the database in JSON format. i.e. food content can also be accessed as JSON via HTTP method, It should be clear how to access the API (this could include comments in code). Additional credit will be given for an API that implements get, post, push and delete.
    /routes/main.js -- line 326 onwards within api
    -- I have implemented the following methods
        -- api documentation and generate a api key (generateAPI.ejs)
        -- control access with api key 
        -- search for a food item 
        -- update a food item's element
        -- delete a food

R11: form validation

    All form data should have validations, examples include checking password length, email validation, integer data is integer and etc. 
    /route/main.js

R12: Your dynamic web application must be implemented in Node.js on your virtual server. The back-end of the web application could be MongoDB or MySQL. Make sure you have included comments in your code explaining all sections of the code including database interactions.
completed


EER
![EER](/EER.png "EER")





