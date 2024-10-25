import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc, onSnapshot, orderBy, getDoc } from 'firebase/firestore';
import './Home.css';

const Home = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [subtasks, setSubtasks] = useState([{ text: '', completed: false }]);
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
        subtasks: subtasks.filter(subtask => subtask.text.trim() !== ''),
        createdAt: new Date(),
      });
      setTask('');
      setSubtasks([{ text: '', completed: false }]);
    } catch (error) {
      console.error('Erro ao adicionar tarefa: ', error);
    }
  };

  const handleAddSubtaskInput = () => {
    setSubtasks([...subtasks, { text: '', completed: false }]);
  };

  const handleSubtaskChange = (index, value) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].text = value;
    setSubtasks(updatedSubtasks);
  };

  const handleCompleteTask = async (id, completed) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      const taskSnapshot = await getDoc(taskRef);
      const taskData = taskSnapshot.data();

      // Atualiza o status da tarefa principal e de todas as subtarefas
      const updatedSubtasks = taskData.subtasks.map(subtask => ({
        ...subtask,
        completed: !completed,
      }));

      await updateDoc(taskRef, {
        completed: !completed,
        subtasks: updatedSubtasks
      });
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

  const handleCompleteSubtask = async (taskId, subtaskIndex) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnapshot = await getDoc(taskRef);
      const taskData = taskSnapshot.data();

      // Alterna o estado da subtarefa específica
      const updatedSubtasks = taskData.subtasks.map((subtask, index) => {
        if (index === subtaskIndex) {
          return { ...subtask, completed: !subtask.completed };
        }
        return subtask;
      });

      // Verifica se todas as subtarefas estão concluídas
      const allSubtasksCompleted = updatedSubtasks.every(subtask => subtask.completed);

      await updateDoc(taskRef, {
        completed: allSubtasksCompleted, // Atualiza a tarefa principal com base nas subtarefas
        subtasks: updatedSubtasks
      });
    } catch (error) {
      console.error('Erro ao atualizar subtarefa: ', error);
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

        {subtasks.map((subtask, index) => (
          <div key={index}>
            <input
              type="text"
              value={subtask.text}
              onChange={(e) => handleSubtaskChange(index, e.target.value)}
              placeholder={`Digite a subtarefa ${index + 1}`}
            />
          </div>
        ))}

        <button type="button" onClick={handleAddSubtaskInput}>+</button>
        <button type="submit">Adicionar Tarefa e Subtarefas</button>
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

              <ul>
                {task.subtasks?.map((subtask, index) => (
                  <li key={index}>
                    <span
                      style={{
                        textDecoration: subtask.completed ? 'line-through' : 'none',
                      }}
                    >
                      {subtask.text}
                    </span>
                    <button onClick={() => handleCompleteSubtask(task.id, index)}>
                      {subtask.completed ? 'Desmarcar' : 'Concluir'}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Home;
