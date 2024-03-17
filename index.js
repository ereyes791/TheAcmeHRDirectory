const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
    user: "esteban",
    password: "123456",
    host: "localhost",
    port: 5432,
    database: "acme_hr_db",
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Error connecting to PostgreSQL', err));

app.use(bodyParser.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Routes
app.get('/api/employees', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM employees');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching employees', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/departments', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM departments');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching departments', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/employees', async (req, res) => {
    const { name, department_id } = req.body;
    try {
        const result = await client.query('INSERT INTO employees (name, department_id) VALUES ($1, $2) RETURNING *', [name, department_id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error creating employee', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/employees/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await client.query('DELETE FROM employees WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting employee', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/employees/:id', async (req, res) => {
    const id = req.params.id;
    const { name, department_id } = req.body;
    try {
        const result = await client.query('UPDATE employees SET name = $1, department_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *', [name, department_id, id]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating employee', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
