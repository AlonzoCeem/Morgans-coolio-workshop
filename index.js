const pg = require('pg')
const client = new pg.Client('postgres://localhost/digimon_db')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())

app.get('/api/digimon', async(req, res, next)=> {
    try {
        const SQL = `
            SELECT *
            FROM digimon;
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.get('/api/digimon:id', async(req, res, next)=> {
    try {
        const SQL = `
            SELECT *
            FROM digimon
            WHERE id = $1;
        `
        const response = await client.query(SQL, [req.params.id])
        if(response.rows.length === 0){
            throw new Error("UH OH! THIS DIGIMON DOES NOT EXIST!")
        }
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.post('/api/digimon', async(req, res, next)=> {
    try {
        const SQL = `
            INSERT INTO digimon(name, type, attributes) 
            VALUES ($1, $2, $3);
        `
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.attributes])
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.put('/api/digimon:id', async(req, res, next)=> {
    try {
        const SQL = `
            UPDATE digimon
            SET name = $1, type = $2, attributes = $3
            WHERE id = $4
            RETURNING *;
        `
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.attributes, req.params.id])
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.delete('/api/digimon:id', async(req, res, next)=> {
    const SQL = `
    DELETE FROM digimon
    WHERE id = $1
    RETURNING *;
    `

    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204)
})

app.use('*', (req, res, next)=> {
    res.status(404).send("404 Page not found")
})

app.use((err, req, res, next)=> {
    res.status(500).send(err.message)
})

const start = async ()=> {
    await client.connect()
    console.log("Connected to database...")
    const SQL = `
    DROP TABLE IF EXISTS digimon;
    CREATE TABLE digimon(
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        type VARCHAR(20),
        attributes VARCHAR(100)
    );
    INSERT INTO digimon (name, type, attributes) VALUES ('Gabumon', 'Reptile', 'Data, Vaccine, Virus');
    INSERT INTO digimon (name, type, attributes) VALUES ('Agumon', 'Reptile', 'Vaccine, Virus');
    INSERT INTO digimon (name, type, attributes) VALUES ('Koromon', 'Lesser', 'None, Data, Free');
    INSERT INTO digimon (name, type, attributes) VALUES ('Botamon', 'Slime', 'None, Data, Free');
    INSERT INTO digimon (name, type, attributes) VALUES ('Lopmon', 'Animal', 'Data');
    `
    await client.query(SQL)

    const port = process.env.PORT || 3000
    app.listen(port, ()=> {
        console.log(`Listening on port ${port}...`)
    })
}
start()