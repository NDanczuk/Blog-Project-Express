const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

// Check login
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Get / Admin - Login Page

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    res.render("admin/index", { locals, layout: adminLayout });
  } catch (e) {
    console.log(e);
  }
});

// Post / Admin - check login

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid login credentials!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid login credentials!" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");

    res.redirect("admin/");
  } catch (e) {
    console.log(e);
  }
});

// Get / Admin Dashboard

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };

    const data = await Post.find();
    res.render("admin/dashboard", {
      locals,
      data,
      layout: adminLayout
    });
  } catch (e) {
    console.error(e)
  }
});

// Get / Admin - create new post

router.get("/add-post", authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: "Add new post",
        description: "Simple Blog created with NodeJs, Express & MongoDb.",
      };
  
      const data = await Post.find();
      res.render("admin/add-post", {
        locals,
        layout: adminLayout
      });
    } catch (e) {
      console.error(e)
    }
  });


// Post / Admin - create new post

router.post("/add-post", authMiddleware, async (req, res) => {
try {
    try {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body
        })

        await Post.create(newPost)
        res.redirect("/dashboard")
    } catch (e) {
        console.error(e)
    }

    res.redirect("/dashboard")
} catch (e) {
    console.error(e)
}
});

// Get / Admin - edit post

router.get("/edit-post/:id", authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit post",
            description: "Simple Blog created with NodeJs, Express & MongoDb.",
        };

      const data = await Post.findOne({_id: req.params.id});
      res.render("admin/edit-post", {
        data,
        locals,
        layout: adminLayout
      });
    } catch (e) {
      console.error(e)
    }
  });


// PUT / Admin - Create new post

router.put("/edit-post/:id", authMiddleware, async (req, res) => {
    try {
      
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })

        res.redirect(`/edit-post/${req.params.id}`)
    } catch (e) {
      console.error(e)
    }
  });



// DELETE / Admin - Delete post

router.delete("/delete-post/:id", authMiddleware, async (req, res) => { 

    try {
        await Post.deleteOne( { _id: req.params.id } )
        res.redirect("/dashboard")
    } catch (e) {
        console.error(e)
    }

})


// GET / Admin - Logout current user

router.get("/logout", (req, res) => {
    res.clearCookie("token")
    //res.json({ message: "Logout successfull!" })
    res.redirect("/admin")
})



// Post / Admin - register - not in use

// router.post("/register", async (req, res) => {
//     try {
//         const { username, password } = req.body
//         const hashedPassword = await bcrypt.hash(password, 10)

//         try {
//             const user = await User.create({ username, password: hashedPassword})
//             res.status(201).json({ message: "User Created", user})
//         } catch (e) {
//             if(e.code === 11000) {
//                 res.status(409).json({ message: "User already in use!"})
//             }
//             res.status(500).json({message: "Internal server error!"})
//         }

//     } catch (e) {
//       console.log(e);
//     }
//   });

// standart router

// router.get('', async (req, res) => {
//   const locals = {
//     title: "NodeJs Blog",
//     description: "Simple Blog created with NodeJs, Express & MongoDb."
//   }

//   try {
//     const data = await Post.find();
//     res.render('index', { locals, data });
//   } catch (error) {
//     console.log(error);
//   }

// });

module.exports = router;
