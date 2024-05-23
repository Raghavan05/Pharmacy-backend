import { connect } from 'mongoose';

const connetionDatabase = ()=>{
    connect(process.env.DB_LOCAL_URI,{
            useNewUrlParser: true, 
            useUnifiedTopology: true
        }).then((con)=> console.log(`MongoDB is connected to the host :  ${con.connection.host}`))
}
export default connetionDatabase;

    // set('strictQuery', true);
    // connect(CONNECTION_URL,{
    //     useNewUrlParser: true, useUnifiedTopology: true
    // }).then(()=> app.listen(PORT, ()=> {console.log(`server running on port ${PORT}`)}))
    // .catch((err)=> console.log(err.message))