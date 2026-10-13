import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import api from '../api';

function Signup(){
    const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSignup() {
    try {
      const response = await api.post('/auth/signup', {
        name: name,
        email: email,
        password: password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert('Cannot reach backend: ' + error.message);
      }
    }
  }




    return(
        <div>
            <h2>Create account</h2>

            <input 
            placeholder="Name"
            value={name}
            onChange={(e)=>setName(e.target.value)}
             />
             <br />
             <input 
             placeholder="Email"
             value={email}
             onChange={(e)=>setEmail(e.target.value)}
              />
              <br />
                <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleSignup}>Sign up</button>
      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
        </div>
    );


}

export default Signup;