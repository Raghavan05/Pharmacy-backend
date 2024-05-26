// import express, { json } from 'express';
import app from './app.js';
// import { set, connect } from 'mongoose';
// import cors from 'cors';
import connetionDatabase from './config/database.js';

connetionDatabase();
const PORT = process.env.PORT || 5000
const server = app.listen(PORT,()=>{
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

// const connectionUrl = mongodb+srv://ragavanr08n2002:Ragav05@cluster0.ypzf5uh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0