import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({

    host: process.env.DB_HOST,
    port: process.env.DB_PORT,

    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,
})


pool.getConnection()

    .then(connection => {
        console.log('MySql connection successfully');
        connection.release();
    })
    .catch(err => {
        console.error('MySql connection failed:', err.message);
    })

export default pool;