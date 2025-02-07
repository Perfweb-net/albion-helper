import React, { useState, useEffect } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {  // Le nom du composant commence par une majuscule
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [pseudo, setPseudo] = useState('');
    const navigate = useNavigate();

    const addTask = () => {
        if (!newTask) return; // Ne rien faire si le champ est vide
        api.post('', { title: newTask })
            .then(() => {
                setNewTask('');
                // Mettre à jour la liste des tâches après l'ajout
                api.get('')
                    .then((response) => setTasks(response.data))
                    .catch((error) => console.error('Error fetching tasks:', error));
            })
            .catch((error) => console.error('Error adding task:', error));
    };

    const deleteTask = (id) => {
        api.delete(`/${id}`)
            .then(() => {
                // Mettre à jour la liste des tâches après la suppression
                setTasks(tasks.filter((task) => task.id !== id));
            })
            .catch((error) => console.error('Error deleting task:', error));
    };

    const handleLogout = () => {
        // Supprimer le token de localStorage lors de la déconnexion
        localStorage.removeItem('token');
        navigate('/'); // Rediriger vers la page de login
    };

    const handleSubmit = async (e) => {
        await api.get("/player/search?pseudo=" + pseudo).then(
            (response) => {
                console.log(response.data);
            }
        );
    }

    console.log(localStorage.getItem('token'));

    return (
        <div>
            dashboard

                <input
                    type="text"
                    placeholder="Pseudo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    required
                />

                <button onClick={handleSubmit}>Submit</button>
        </div>
    );
};

export default Dashboard;  // Le nom du composant doit aussi être en majuscule ici
