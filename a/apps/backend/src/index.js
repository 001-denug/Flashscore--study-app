
const express = require("express");
const cors = require("cors");
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);

app.get("/", (req, res) => res.send("Backend Express server running"));

app.listen(PORT, () => console.log(`Express server listening on port ${PORT}`));
