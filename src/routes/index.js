const { Router } = require('express');
const passport = require('passport');
const router = Router();


router.post('/login',passport.authenticate('login',
{ failureRedirect: 'faillogin' }),(req,res) => {
    res.redirect('/')
});

router.get('/faillogin', (req,res) => {
    res.render('login-error', {});
});

router.get("/register", (req, res) => {
    res.render("register");
  });
  
router.post("/register",passport.authenticate("register", { failureRedirect: "/failregister" }),(req, res) => {
    res.redirect("/");
});
  
router.get("/failregister", (req, res) => {
    res.render("register-error", {});
});
  
router.get("/logout", (req, res) => {
    const { username } = req.user;
    req.logout();
    res.render("logout", { username });
});

const checkIsAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.render("login");
    }
  };
  
router.get("/login", checkIsAuthenticated, (req, res) => {
    res.render("login.hbs");
});
  
router.get("/", checkIsAuthenticated, (req, res) => {
    res.render("home", {
    username: req.user.username,
    });
});

// ----------------------------- 
// router.get('/', (req, res) => {
//     res.render('index');
// });

// router.post('/register', (req, res) => {
//     const { email, password } = req.body;
//     req.session.user_data = {email, password};
//     req.flash('success', 'Now You are Registered')
//     res.redirect('/profile');
// });

// router.get('/profile', (req, res) => {
//     const user = req.session.user_data;

//     if(user){
//         res.render('profile', {
//             user
//         });
//     }
//     if(!user){
//         res.redirect('/');
//     }
// });


// router.get('/logout', (req, res) => {
//     //delete req.session.user_data;
//     req.session.destroy();
//     res.redirect('/')
// });

module.exports = router;