import bcrypt from "bcrypt";

const hashedPassword = bcrypt.hashSync("password123", 10);

const users = [
  {
    id: 1,
    username: "admin",
    password: hashedPassword,
  },
];

export default users;
