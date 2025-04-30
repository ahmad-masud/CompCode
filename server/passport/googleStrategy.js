const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ uid: profile.id });

          if (existingUser) return done(null, existingUser);

          const newUser = await User.create({
            uid: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            photo: profile.photos?.[0]?.value,
          });

          done(null, newUser);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
};