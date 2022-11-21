import { PrismaClient } from "@prisma/client";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { body, validationResult } from "express-validator";
const port = process.env.PORT || 3002;

dotenv.config();
const prisma = new PrismaClient();
const app = express();

// async function deleteAllusers() {
//   await prisma.user.deleteMany({});
//   const users = await prisma.user.findMany();
//   console.log(users);
// }

// deleteAllusers()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "views")));

app.get("/", async (req, res) => {
  const users = await prisma.user.findMany({});
  res.render("signup", { users });
});

app.post(
  "/",
  body("username").trim().escape().notEmpty().withMessage("invalid username"),
  body("password")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 1 })
    .withMessage("invalid password"),
  body("confirm")
    .trim()
    .escape()
    .notEmpty()
    .isLength({ min: 1 })
    .custom((value, { req }) => value === req.body.password)
    .withMessage("password does not match"),
  async (req, res) => {
    const { username, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.redirect("/");
    }
    try {
      await prisma.user.create({
        data: {
          username,
          password,
        },
      });
    } catch (err) {
      console.log("failed to create new user");
      console.log(err);
    }
    return res.redirect("/");
  }
);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
