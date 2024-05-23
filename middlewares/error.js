import ErrorHandler from "../utils/errorHandler.js";

export default (err, req, res, next)=>{
    err.statusCode = err.statusCode || 501;


    if(process.env.NODE_ENV === 'development'){
        res.status(err.statusCode).json({
            success : false,
            message : err.message,
            stack : err.stack,
            error : err
        })
    }

    if(process.env.NODE_ENV === 'production'){
        let message = err.message;
        let error = new Error(message);
        if(err.name == "ValidationError"){
            message = Object.values(err.errors).map(value => value.message)
            error = new Error(message)
            err.statusCode = 400;
        }
        if(err.name == "CastError"){
            message = `Resource not found : ${err.path}`;
            error = new Error(message)
            err.statusCode = 400;
        }
        if(err.code === 11000){
            let message = `Dupilcate ${Object.keys(err.keyValue)} error`
            error = new Error(message);
            err.statusCode = 400;
        }
        if(err.name === 'JSONWebTokenError'){
            let message = `JSON web token is invalid. try again`;
            error = new Error(message);
            err.statusCode = 400;
        }
        if(err.name === 'TokenExpriedError'){
            let message = `JSON web token is invalid. try again`;
            error = new Error(message);
            err.statusCode = 400;
        }
        res.status(err.statusCode).json({
            success:false,
            message :error.message || 'Internal Server Error'
        })

    }
}