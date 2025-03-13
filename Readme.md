# backend Project

1. forphotos we upload on the cloud and then access them via strings
2. we form git keeep to put the empty folder onto git
3. make a file name .gitignore
4. use gitignore generator
5. make a .env file
6. next we install dev dependency for nodemon as we do not want to restart again and again for the website to load
7. using npm i -D nodemon
8 . nodemon will restore the things in src folder so we wll speacify the script
9. "dev": "nodemon src/index.js"
10. inside the src folder name the follwoing folders - controllers , db, middlewares, models, routes, utils

 basic changes are the above

 1. now we write PORt in .env file
 2. and also write mongoDB URI or URL and remove the slash at end ant enter the password in that
 3. write the DB name in constants in src
 4. for dealing with .env we will have to install dotenv package --- npm i mongoose express dotenv
5. call the database --we never directly call the data bases we do in try catch or using promise


////////

1. now in app.js we import express form and app and export it.
2. exporting the app returns a promise so in index.js we form a then and catch for the app and db dont foget to chain the then catch to connectdb()
3. next we need to insatll cookie parser and cors
4. import cors and cookie parser in app,js.
5. now since we will be talking to database again and again so we form a file asynchandeler.js in utils folder where we will pass it as a method
6. now we write the function for the route error handeling


///////////

1. next we standarize the error handeling of api so that out erro in route handling is given so that we can understand it so we do that in apiresponse.js
2. next we have to kepp a structored track of api response
The ApiResponse class is useful for creating consistent and structured responses in an API. It helps ensure that all responses have the same format, making it easier to handle them on the client side.
3.