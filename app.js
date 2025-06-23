require('dotenv').config();
const express = require('express');
const TASKS = require('./tasks');


const PORT = process.env.PORT;
const app = express();



app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) => {
    res.send('Welcome to the Task Manager API');
});

// Retrieve all tasks
app.get('/tasks', (req, res) => {
    let filteredTasks = [...TASKS];

    const { completed } = req.query;

    if (typeof completed !== 'undefined') {
        const isCompletedBoolean = completed.toLowerCase() === 'true';
        if (completed.toLowerCase() !== 'true' && completed.toLowerCase() !== 'false') {
            return res.status(400).json({ message: 'Invalid value for "completed" query parameter. Must be "true" or "false".' });
        }

        filteredTasks = filteredTasks.filter(task => task.completed === isCompletedBoolean);
    }

    res.json(filteredTasks);


});


// Retrieve a specific task by its ID
app.get('/tasks/:id', (req, res) => {

    const taskId = req.params.id;
    if (isNaN(taskId) || taskId <= 0) {
        return res.statusCode(400).json({ message: "Invalid Task ID provided" });
    }
    const task = TASKS.find(task => task.id === parseInt(taskId));
    if (task) {
        res.json(task)
    }
    else {
        res.status(404).json({ message: 'Task not found' });
    }
});


// Create a new task with the required fields (title, description, completed)
app.post('/tasks', (req, res) => {

    const { title, description, completed } = req.body;
    const errors = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required and must be a non-empty string.');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
        errors.push('Description is required and must be a non-empty string.');
    }
    if (typeof completed !== 'boolean') {
        errors.push('Completed status is required and must be a boolean value.');
    }

    if (errors.length > 0) {
        return res.status(400).json({ messages: errors });

    };
    const newTask = {
        id: TASKS.length > 0 ? Math.max(...TASKS.map(task => task.id)) + 1 : 1,
        title,
        description,
        completed


    }
    TASKS.push(newTask)
    // console.log(TASKS)
    res.status(201).json(newTask)

});


// Update an existing task by its ID
app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const updatedTaskData = req.body;
    const errors = []
    if (isNaN(taskId) || taskId <= 0) {
        return res.status(400).json({ message: 'Invalid Task ID provided.' });
    }
    const taskIndex = TASKS.findIndex(task => task.id === parseInt(taskId));
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }
    if (updatedTaskData.hasOwnProperty('title')) {
        if (typeof updatedTaskData.title !== 'string' || updatedTaskData.title.trim().length === 0) {
            errors.push('Title must be a non-empty string.');
        } else {
            updatedTaskData.title = updatedTaskData.title.trim();
        }
    }
    if (updatedTaskData.hasOwnProperty('description')) {
        if (typeof updatedTaskData.description !== 'string' || updatedTaskData.description.trim().length === 0) {
            errors.push('Description must be a non-empty string.');
        } else {
            updatedTaskData.description = updatedTaskData.description.trim();
        }
    }
    if (updatedTaskData.hasOwnProperty('completed')) {
        if (typeof updatedTaskData.completed !== 'boolean') {
            errors.push('Completed status must be a boolean value.');
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({ messages: errors });
    }
    if (Object.keys(updatedTaskData).length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }
    TASKS[taskIndex] = { ...TASKS[taskIndex], ...updatedTaskData };
    TASKS.sort((a, b) => a.id - b.id);

    res.status(200).json({ message: `Task with ID ${taskId} updated successfully.` });

});


// Delete a task by its ID
app.delete('/tasks/:id', (req, res) => {

    const taskId = req.params.id;
    const taskIndex = TASKS.findIndex(task => task.id === parseInt(taskId));
    if (taskIndex !== -1) {
        TASKS.splice(taskIndex, 1);
        res.status(200).json({ message: `Successfully deleted Task ${taskId} ` });
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
});
app.listen(PORT, (err) => {
    if (err) {
        return console.log('Something bad happened', err);
    }
    console.log(`Server is listening on ${PORT}`);
});
module.exports = app;