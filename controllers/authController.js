const User = require("../models/User");
const { validationResult } = require("express-validator");
const { nanoid } = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config();
//Formulario de Registro
const registerForm = (req, res) => {
  res.render("register");
};
//Formulario de Logeo
const loginForm = (req, res) => {
  res.render("login");
};
//Registro Funcion
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.json(errors);
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/register");
  }

  const { userName, email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });
    if (user) throw new Error("ya existe usuario");

    user = new User({ userName, email, password, tokenConfirm: nanoid() });
    await user.save();

    //Envio de Correo con Nodemailer
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.USEREMAIL,
        pass: process.env.PASSEMAIL,
      },
    });
    await transport.sendMail({
      from: "urlshortcut_nicolas@noreply.com", // sender address
      to: user.email, // list of receivers
      subject: "Verifica tu cuenta de correo", // Subject line
      html: `<!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
      </head>
      <body>
          <div class="container justify-content-center">
      
              <p class="text-center">Has sido registrado en URL Shortcut by @Nicolas! <br> porfavor valida tu cuenta para poder iniciar sesion</p>
              <div class="col-md-12 text-center">
              <button type="button" class="btn btn-light text-center" ><a href="${
                process.env.PATHHEROKU || "http://localhost:5000"
              }auth/confirmar/${
        user.tokenConfirm
      }">Verifica tu cuenta aqui!</a></button>
              </div>
          </div>
      
          <style>
              button{
                  align-items: center;
              }
              a:link, a:visited, a:active {
                  text-decoration:none;
      }
          </style>
      </body>
      </html>`,
    });
    //

    req.flash("mensajes", [
      { msg: "Revisa tu correo electronico y valida la cuenta!" },
    ]);
    return res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/register");
    // return res.json({ error: error.message });
  }
};
//Registro (Confirmacion de Cuenta) funcion
const confirmarCuenta = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ tokenConfirm: token });

    if (!user) throw new Error("No existe este usuario");

    user.cuentaConfirmada = true;
    user.tokenConfirm = null;

    await user.save();

    req.flash("mensajes", [
      { msg: "Cuenta verificada, puedes iniciar sesión." },
    ]);
    return res.redirect("/auth/login");
    // res.render("login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
    // return res.json({ error: error.message });
  }
};
//Login Funcion
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/login");
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("No existe este email");

    if (!user.cuentaConfirmada) throw new Error("Falta confirmar cuenta");

    if (!(await user.comparePassword(password)))
      throw new Error("Contraseña no correcta");

    // me está creando la sesión de usuario a través de passport
    req.login(user, function (err) {
      if (err) throw new Error("Error con al crear la sesión");
      return res.redirect("/");
    });
  } catch (error) {
    // console.log(error);
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
    // return res.send(error.message);
  }
};
//Cerrar sesion funcion
const cerrarSesion = (req, res) => {
  req.logout();
  return res.redirect("/auth/login");
};
//Exportaciones Node.js
module.exports = {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
};
