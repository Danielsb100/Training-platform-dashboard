
        function toggleMode(mode) {
            document.getElementById('error-msg').style.display = 'none';
            if (mode === 'register') {
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('register-form').style.display = 'block';
            } else {
                document.getElementById('register-form').style.display = 'none';
                document.getElementById('login-form').style.display = 'block';
            }
        }

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> LOG IN';
            btn.disabled = true;

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const result = await response.json();
                
                if (response.ok && result.ok) {
                    if (result.token) localStorage.setItem('token', result.token);
                    window.location.href = '/index.html';
                } else {
                    const errMsg = document.getElementById('error-msg');
                    errMsg.innerText = result.error || 'Login failed.';
                    errMsg.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
                const errMsg = document.getElementById('error-msg');
                errMsg.innerText = 'Connection error.';
                errMsg.style.display = 'block';
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> CREATE ACCOUNT';
            btn.disabled = true;

            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            
            try {
                const response = await fetch('/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                
                const result = await response.json();
                
                if (response.ok && result.ok) {
                    if (result.token) localStorage.setItem('token', result.token);
                    window.location.href = '/login.html'; 
                } else {
                    const errMsg = document.getElementById('error-msg');
                    errMsg.innerText = result.error || 'Registration failed.';
                    errMsg.style.display = 'block';
                }
            } catch (err) {
                console.error(err);
                const errMsg = document.getElementById('error-msg');
                errMsg.innerText = 'Connection error.';
                errMsg.style.display = 'block';
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    
