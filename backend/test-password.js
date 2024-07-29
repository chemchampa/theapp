const bcrypt = require('bcrypt');

const storedHash = '$2b$10$v8E..PbLgw5S4ACjktqrQeKw6QKULh5Wr2jAoLBtlh6h0xKDvSs4i'; // The hash from your database
const plainTextPassword = '123ZaRRaZa123!'; // The password you're trying to use

bcrypt.compare(plainTextPassword, storedHash, (err, result) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password match:', result);
  }
});
