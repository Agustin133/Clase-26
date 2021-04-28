const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');

const passport = require('passport');
const bCrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const { options } = require('./conection')
const { users } = require('./create_model');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(flash());

app.use(cookieParser());
app.use(session({
    store: MongoStore.create({ 
        mongoUrl: 'mongodb://localhost/sesiones',
        ttl: 10 * 60, // 10 min
    }),
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 6000
    }
}));

app.engine("hbs",handlebars({
    extname: ".hbs",
    defaultLayout: "index.hbs",
  })
);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    "login",
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      (req, username, password, cb) => {
        users.findOne({ username: username }, (err, user) => {
          if (err) return done(err);
          if (!user) {
            console.log("User Not Found with username " + username);
            return cb(null, false);
          }
          if (!validatePassword(user, password)) {
            console.log("Invalid Password");
            return cb(null, false);
          }
          return cb(null, user);
        });
      }
    )
  );

  const validatePassword = (user, password) => {
    return bCrypt.compareSync(password, user.password);
  };
  
passport.use("register",new LocalStrategy({
        passReqToCallback: true,
      },
      function (req, username, password, cb) {
        const findOrCreateUser = function () {
          users.findOne({ username: username }, function (err, user) {
            if (err) {
              console.log("Error in SignUp: " + err);
              return cb(err);
            }
            if (user) {
              console.log("User already exists");
              return cb(null, false);
            } else {
              var newUser = new users();
              newUser.username = username;
              newUser.password = createHash(password);
              newUser.save((err) => {
                if (err) {
                  console.log("Error in Saving user: " + err);
                  throw err;
                }
                console.log("User Registration succesful");
                return cb(null, newUser);
              });
            }
          });
        };
        process.nextTick(findOrCreateUser);
      }
    )
);
  
let createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};
  
passport.serializeUser((user, done) => {
    done(null, user._id);
});
  
passport.deserializeUser((id, done) => {
    users.findById(id, function (err, user) {
      done(err, user);
    });
  });

app.use((req, res, next) => {
    app.locals.messages = req.flash('success');
    next();
});

app.use(require('./routes/index'));

app.listen( 3000, () => {
    console.log('Server on port: http://localhost:3000');
});
