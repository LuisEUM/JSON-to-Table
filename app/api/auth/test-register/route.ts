import { NextResponse } from "next/server";

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Formulario de Registro - Prueba</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          background-color: #4CAF50;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .result {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-height: 100px;
        }
      </style>
    </head>
    <body>
      <h1>Formulario de Registro - Prueba</h1>
      <form id="registerForm">
        <div class="form-group">
          <label for="name">Nombre:</label>
          <input type="text" id="name" name="name" required minlength="2">
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" name="password" required minlength="8">
        </div>
        <button type="submit">Registrar</button>
      </form>
      
      <div class="result">
        <h3>Resultado:</h3>
        <pre id="result">Esperando envío...</pre>
      </div>
      
      <script>
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const result = document.getElementById('result');
          result.textContent = 'Enviando...';
          
          try {
            const response = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
              }),
            });
            
            const data = await response.json();
            result.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            result.textContent = 'Error: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
