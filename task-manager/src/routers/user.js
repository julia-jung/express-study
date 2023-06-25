const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

const router = new express.Router();

// router.get('/test', (req, res) => {
//     res.send('From a new File');
// });

// sign up
router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// login
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

// logout
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// logout all sessions
router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    console.log('user logout all');
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// no longer needed
// router.get('/users', auth, async (req, res) => {
//     try {
//         const users = await User.find({});
//         res.send(users);
//     }catch(e) {
//         res.status(500).send();
//     }
// });

// read profile
router.get('/users/me', auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    res.send(500).send();
  }
});

// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id);
//         if(!user) {
//             res.status(404).send();
//         }
//         res.send(user);
//     }catch(e) {
//         res.status(500).send();
//     }
// });

// update user profile
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body); //return array of string of property on the object
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(404).send({ error: 'Invalid Updates' });
  }

  try {
    // const user = await User.findById(req.params.id);
    // const user = req.user;
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!req.user) {
      return res.status(404).send();
    }
    res.send(req.user);
  } catch (e) {
    //could be server error or validation error
    res.status(400).send(e);
  }
});

// delete user profile
router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if(!user) {
    //     return res.status(404).send();
    // }
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

const upload = multer({
  // dest: 'avatars',
  limits: {
    // restricting file size
    fileSize: 1000000, //1 mega byte
  },
  fileFilter(req, file, cb) {
    //restric file type
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload image file')); //callback
    }
    cb(undefined, true);
    // cb(undefined, false);
  },
});

// 5. add auth before multer
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    // req.user.avatar = req.file.buffer;
    // 9.
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 }) // resize image
      .png() // change it to .png file
      .toBuffer();
    req.user.avatar = buffer;

    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    // 4. add error handler
    res.status(400).send({ error: error.message });
  }
);

//7. delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// 8. getting avatar image
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;
