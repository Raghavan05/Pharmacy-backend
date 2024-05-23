// import express, { json } from 'express';
import app from './app.js';
// import { set, connect } from 'mongoose';
// import cors from 'cors';
import connetionDatabase from './config/database.js';

connetionDatabase();
const server = app.listen(process.env.PORT,()=>{
    console.log(`Server running on port : ${process.env.PORT} in ${process.env.NODE_ENV}`);
})


process.on('unhandledRejection',(err)=>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting Down the Server due to unhandled rejection");
    server.close(()=>{
        process.exit(1);
    });
})


process.on("uncaughtException",(err)=>{
    console.log(`Error : ${err.message}`);
    console.log("Shutting Down the Server due to uncaught exception");
    server.close(()=>{
        process.exit(1);
    });
})

// const CONNECTION_URL = "mongodb+srv://ragavanr08n2002:RagavanPharmacy#09102023@cluster0.ypzf5uh.mongodb.net/?retryWrites=true&w=majority"
