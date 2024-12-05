const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const db = require("./db");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Middleware pour parser le JSON
app.use(express.json());

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Filma API",
      version: "1.0.0",
      description: "API pour gérer les films",
    },
    components: {
      schemas: {
        Movie: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID du film", example: 1 },
            title_file: {
              type: "string",
              description: "Titre du fichier",
              example: "Inception",
            },
            disk: {
              type: "string",
              description: "Nom du disque",
              example: "Disque1",
            },
            file: {
              type: "string",
              description: "Nom du fichier",
              example: "inception.mp4",
            },
            sub_file: {
              type: "string",
              description: "Nom du fichier de sous-titres",
              example: "inception.srt",
            },
            type_file: {
              type: "string",
              description: "Type de fichier",
              example: "mp4",
            },
            size: {
              type: "string",
              description: "Taille du fichier",
              example: "1.5GB",
            },
            is_new: {
              type: "boolean",
              description: "Indique si le film est nouveau",
              example: true,
            },
          },
        },
        MovieInput: {
          type: "object",
          properties: {
            title_file: { type: "string", description: "Titre du fichier" },
            disk: { type: "string", description: "Nom du disque" },
            file: { type: "string", description: "Nom du fichier" },
            sub_file: {
              type: "string",
              description: "Nom du fichier de sous-titres",
            },
            type_file: { type: "string", description: "Type de fichier" },
            size: { type: "string", description: "Taille du fichier" },
            is_new: {
              type: "boolean",
              description: "Indique si le film est nouveau",
            },
          },
          required: ["title_file"],
        },
      },
    },
  },
  apis: ["./app.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Gestion des films
 */

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Récupère la liste de tous les films
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Liste des films
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 */
app.get("/movies", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM movies");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Récupère un film par son ID
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du film
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Film trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Film non trouvé
 */
app.get("/movies/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM movies WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      res.status(404).json({ message: "Film non trouvé" });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Crée un nouveau film
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovieInput'
 *     responses:
 *       201:
 *         description: Film créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 */
app.post("/movies", async (req, res) => {
  try {
    const { title_file, disk, file, sub_file, type_file, size, is_new } =
      req.body;
    const [result] = await db.query(
      "INSERT INTO movies (title_file, disk, file, sub_file, type_file, size, is_new) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title_file, disk, file, sub_file, type_file, size, is_new || false]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Met à jour un film existant
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du film
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovieInput'
 *     responses:
 *       200:
 *         description: Film mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Film non trouvé
 */
app.put("/movies/:id", async (req, res) => {
  try {
    const { title_file, disk, file, sub_file, type_file, size, is_new } =
      req.body;
    const [result] = await db.query(
      "UPDATE movies SET title_file = ?, disk = ?, file = ?, sub_file = ?, type_file = ?, size = ?, is_new = ? WHERE id = ?",
      [title_file, disk, file, sub_file, type_file, size, is_new, req.params.id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Film non trouvé" });
    } else {
      res.json({ id: req.params.id, ...req.body });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Supprime un film
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du film
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Film supprimé avec succès
 *       404:
 *         description: Film non trouvé
 */
app.delete("/movies/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM movies WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Film non trouvé" });
    } else {
      res.json({ message: "Film supprimé avec succès" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware pour les routes non définies
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
