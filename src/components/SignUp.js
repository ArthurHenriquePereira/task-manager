// src/components/SignUp.js
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './SignUp_Login.css'; // Importando o CSS criado anteriormente

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Criando o usuário com e-mail/senha
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Salvando os dados do usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        uid: user.uid,
      });

      setSuccess('Usuário cadastrado com sucesso!');
      setEmail('');
      setPassword('');

      // Redireciona para a página inicial
      navigate('/home');
    } catch (error) {
      // Tratando erro de email já cadastrado
      if (error.code === 'auth/email-already-in-use') {
        setError('Já existe uma conta cadastrada com este e-mail.');
      } else {
        setError(error.message); // Para outros erros, mostra a mensagem padrão
      }
    }
  };

  const handleGithubSignIn = async () => {
    const provider = new GithubAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Salvar os dados do usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        uid: user.uid,
        provider: 'github',
      });

      // Redireciona para a página inicial
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container">
      <h2>Cadastro</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
      <form onSubmit={handleSignUp}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          required
        />
        <button type="submit">Cadastrar</button>
      </form>

      <hr />

      <h3>Ou entre com</h3>
      <button onClick={handleGithubSignIn} className="github-button">
        Registrar com GitHub
      </button>

      <p>
        Já possui uma conta?{' '}
        <span
          className="login-link"
          onClick={() => navigate('/login')}
        >
          Faça Login.
        </span>
      </p>
    </div>
  );
};

export default SignUp;