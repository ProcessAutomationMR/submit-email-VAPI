const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Default route to check server status
app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

// ✅ Route to capture email confirmation (Improved Layout)
app.get('/capture-email', (req, res) => {
  const clientKey = req.query.key;

  if (!clientKey) {
    return res.status(400).send("⚠️ Clé client manquante.");
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmez votre adresse e-mail</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f4fa;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .container {
          background-color: #ffffff;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
          width: 400px;
        }
        h1 {
          font-size: 1.5rem;
          color: #4A90E2;
          margin-bottom: 1rem;
        }
        label {
          font-size: 1rem;
          color: #333;
          display: block;
          margin-bottom: 0.5rem;
        }
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #cbd5e0;
          border-radius: 5px;
          font-size: 1rem;
        }
        button {
          background-color: #4A90E2;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 1rem;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 1rem;
          width: 100%;
        }
        button:hover {
          background-color: #357ABD;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Confirmez votre adresse e-mail</h1>
        <form action="/submit-email" method="POST">
          <input type="hidden" name="clientKey" value="${clientKey}">
          <label for="email">Entrez votre e-mail :</label>
          <input type="email" id="email" name="email" required>
          <button type="submit">Confirmer</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// ✅ Route to Submit Email to Make.com Webhook
app.post('/submit-email', async (req, res) => {
  const { clientKey, email } = req.body;

  if (!clientKey || !email) {
    return res.status(400).send('⚠️ Informations manquantes.');
  }

  try {
    console.log("📤 Sending data to Make.com:", { clientKey, email });

    const response = await axios.post('https://hook.eu2.make.com/ajpzjbry7w7pj3l9oy21q6i4idfhle5r', 
      { clientKey, email }, 
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log("✅ Webhook Response:", response.status, response.data);
    res.send('🎉 Merci, votre adresse e-mail a bien été confirmée.');

  } catch (error) {
    console.error("🚨 Erreur Webhook:", error.response?.status, error.response?.data);
    res.status(500).send(`❌ Erreur lors de l'envoi de votre e-mail. Détails: ${error.message}`);
  }
});

// ✅ Route to convert a given date into fixed start and end times
app.post('/convert-date', (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ error: "⚠️ Missing 'date' parameter." });
  }

  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) {
    return res.status(400).json({ error: "⚠️ Invalid date format. Please provide a valid ISO date string." });
  }

  const datePart = inputDate.toISOString().split("T")[0];
  const startTime = `${datePart}T09:00:00`;
  const endTime = `${datePart}T18:00:00`;

  res.status(200).json({ startTime, endTime });
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
