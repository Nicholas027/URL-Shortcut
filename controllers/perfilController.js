const formidable = require("formidable");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Jimp = require("jimp");

module.exports.formPerfil = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.render("perfil", { user: req.user, imagen: user.imagen });
  } catch (error) {
    req.flash("mensajes", [{ msg: "Error al leer el usuario" }]);
    return res.redirect("/perfil");
  }
};

module.exports.editarFotoPerfil = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.masFileSize = 50 * 1024 * 1024; //50mb
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        throw new Error("Falló la subida de imagen");
      }

      const file = files.myFile;
      if (file.originalFilename === "") {
        throw new Error("No seleccionaste ninguna imagen");
      }

      const imageTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!imageTypes.includes(file.mimetype)) {
        throw new Error("Solo se permiten imagenes jpeg y png");
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error("La imagen es muy pesada");
      }

      const extension = file.mimetype.split("/")[1];
      const dirFile = path.join(
        __dirname,
        `../public/img/perfiles/${req.user.id}.${extension}`
      );
      fs.renameSync(file.filepath, dirFile);

      const image = await Jimp.read(dirFile);
      image.resize(200, 200).quality(90).writeAsync(dirFile);

      const user = await User.findById(req.user.id);
      user.imagen = `${req.user.id}.${extension}`;
      await user.save();

      req.flash("mensajes", [{ msg: "Imagen Subida" }]);
    } catch (error) {
      console.log(error);
      req.flash("mensajes", [{ msg: error.message }]);
    } finally {
      return res.redirect("/perfil");
    }
  });
};
