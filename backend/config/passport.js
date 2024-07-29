const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db');
const jwt = require('jsonwebtoken');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const result = await pool.query('SELECT id, email, tenant_id, organization_id FROM auth.users WHERE id = $1', [payload.userId]);
    
    if (result.rows.length > 0) {
      return done(null, result.rows[0]);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback" // or "http://localhost:5000/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if user exists
      const userResult = await client.query('SELECT * FROM auth.users WHERE google_id = $1', [profile.id]);
      let user;

      if (userResult.rows.length === 0) {
        // User doesn't exist, create a new one
        const newUserResult = await client.query(
          'INSERT INTO auth.users (google_id, email, username) VALUES ($1, $2, $3) RETURNING *',
          [profile.id, profile.emails[0].value, profile.displayName]
        );
        user = newUserResult.rows[0];

        // We don't set tenant_id or organization_id here
        // The user will be redirected to select or create an organization
      } else {
        user = userResult.rows[0];
      }

      await client.query('COMMIT');

      // Create a JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          tenantId: user.tenant_id, 
          organizationId: user.organization_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Attach the token and organization status to the user object
      user.token = token;
      user.needsOrganization = !user.tenant_id || !user.organization_id;

      done(null, user);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    done(error, null);
  }
}
));

passport.serializeUser((user, done) => {
done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
try {
  const result = await pool.query('SELECT * FROM auth.users WHERE id = $1', [id]);
  done(null, result.rows[0]);
} catch (error) {
  done(error, null);
}
});

module.exports = passport;