import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';


function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
     const navigate = useNavigate();

    async function handleLogin(){
        try{
            const response=await api.post('/auth/login',{
                email:email,
                password:password,

            });

            localStorage.setItem('token',response.data.token);
            navigate('/dashboard');


        }
        catch (error) {
       console.log(error);
        if (error.response) {
    alert(error.response.data.message);
  } else {
    alert('Cannot reach backend: ' + error.message);
  }
}
    


    }

    return(
        <div>
            <h2>Login</h2>
            <input placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            />
            <br />
            <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
             />
             <br />
             <button onClick={handleLogin}>Login</button>
             <p>
  New here? <Link to="/signup">Sign up</Link>
</p>
        </div>
    );

}

export default Login;