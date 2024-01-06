const passport = require("passport");
const mongoose = require("mongoose");
const { Strategy: LocalStrategy } = require("passport-local");
const User = require("../model/user");
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
          return done(null, false, { msg: `Email ${email} not found.` });
        }

        user.comparePassword(password, async (err, isMatch) => {
          if (err) {
            console.log("===comparePassword", err);
            return done(err);
          }
          if (isMatch) {
            let token = await user.generateAuthToken();
            user.token = token;
            return done(null, user);
          }
          return done(null, false, { msg: "Invalid email or password." });
        });
      } catch (err) {
        return done(err);
      }
    }
  )
);
