import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import './Home.css';

const Home = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksArray = [];
      querySnapshot.forEach((doc) => {
        tasksArray.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (task.trim() === '') {
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        task,
        completed: false,
        uid: user.uid,
        createdAt: new Date(),
      });
      setTask('');
    } catch (error) {
      console.error('Erro ao adicionar tarefa: ', error);
    }
  };

  const handleCompleteTask = async (id, completed) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, { completed: !completed });
    } catch (error) {
      console.error('Erro ao atualizar tarefa: ', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Erro ao excluir tarefa: ', error);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className="container">
      <h2>Gerenciamento de Tarefas</h2>
      <p>Bem-vindo, {user?.email}</p>
      <button onClick={handleLogout}>Sair</button>

      <form onSubmit={handleAddTask}>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Digite uma nova tarefa"
        />
        <button type="submit">Adicionar Tarefa</button>
      </form>

      {loading ? (
        <p>Carregando tarefas...</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <span
                style={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}
              >
                {task.task}
              </span>
              <div>
                <button onClick={() => handleCompleteTask(task.id, task.completed)}>
                  {task.completed ? 'Desmarcar' : 'Concluir'}
                </button>
                <button onClick={() => handleDeleteTask(task.id)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Home;
