// const express = require('express');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const { body, validationResult } = require('express-validator');

// const app = express();
// const PORT = process.env.PORT || 5000;

// try {
//     mongoose.connect('mongodb://127.0.0.1:27017/drivingAssessmentDB', {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//     });
//     console.log('Connected to MongoDB successfully');
// } catch (error) {
//     console.error('Error connecting to MongoDB:', error.message);
// }

// app.use(express.json());
// app.use(cors());

// app.use(session({
//     secret: 'your-secret-key',
//     resave: true,
//     saveUninitialized: true
// }));

// const User = mongoose.model('User', {
//     name: String,
//     address: String,
//     contactDetails: String,
//     email: String,
//     password: String,
// });

// const validateRegistrationInput = [
//     body('name').trim().isLength({ min: 2 }),
//     body('address').trim().isLength({ min: 3 }).withMessage('Address must be at least 3 characters'),
//     body('contactDetails').trim().isLength({ min: 10 }).withMessage('Contact details must be at least 10 characters'),
//     body('email').trim().isEmail().withMessage('Invalid email address'),
//     body('password').isLength({ min: 8, max: 16 }).withMessage('Password must be at least 8 characters'),
// ];

// app.post('/register', validateRegistrationInput, handleRegistration);

// async function handleRegistration(req, res) {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         const { name, address, contactDetails, email, password } = req.body;
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const user = new User({
//             name,
//             address,
//             contactDetails,
//             email,
//             password: hashedPassword,
//         });

//         await user.save();
//         console.log({ message: 'User Registered successfully' });
//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (error) {
//         if (error.code === 11000) {
//             return res.status(400).json({ message: 'Duplicate entry. Name, contact details, or email already exists.' });
//         }
//         res.status(500).json({ error: error.message });
//     }
// }
// app.post('/login', validateLoginInput, handleLogin);

// async function handleLogin(req, res) {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });

//         if (user && (await bcrypt.compare(password, user.password))) {
//             // If login is successful, store user ID in session
//             req.session.userId = user._id;
//             res.status(200).json({ message: 'Login successful' });
//         } else {
//             res.status(401).json({ message: 'Invalid credentials' });
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// app.post('/logout', (req, res) => {
//     // Destroy the session on logout
//     req.session.destroy((err) => {
//         if (err) {
//             console.error('Error destroying session:', err);
//             res.status(500).json({ error: 'Internal Server Error' });
//         } else {
//             res.status(200).json({ message: 'Logout successful' });
//         }
//     });
// });


// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser'); // Add body-parser

const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

try {
    mongoose.connect('mongodb://127.0.0.1:27017/drivingAssessmentDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');
} catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
}

app.use(express.json());
app.use(cors());

app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));

const User = mongoose.model('User', {
    name: String,
    address: String,
    contactDetails: String,
    email: String,
    password: String,
});
const authenticateUser = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};


const validateRegistrationInput = [
    body('name').trim().isLength({ min: 2 }),
    body('address').trim().isLength({ min: 3 }).withMessage('Address must be at least 3 characters'),
    body('contactDetails').trim().isLength({ min: 10 }).withMessage('Contact details must be at least 10 characters'),
    body('email').trim().isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8, max: 16 }).withMessage('Password must be at least 8 characters'),
];
const validateLoginInput = [
    body('email').trim().isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 8, max: 16 }).withMessage('Password must be at least 8 characters'),
];
app.post('/register', validateRegistrationInput, handleRegistration);

async function handleRegistration(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, address, contactDetails, email, password } = req.body;

        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            address,
            contactDetails,
            email,
            password: hashedPassword,
        });

        await user.save();
        console.log({ message: 'User Registered successfully' });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
app.post('/login',validateLoginInput, handleLogin );

// async function handleLogin(req, res) {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });

//         if (user && (await bcrypt.compare(password, user.password))) {
//             // If login is successful, store user ID in session
//             req.session.userId = user._id;
//             res.status(200).json({ message: 'Login successful' });
//         } else {
//             res.status(401).json({ message: 'Invalid credentials' });
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }

// ... (previous code)

async function handleLogin(req, res) {
    try {
        const { email, password } = req.body;
        
        // Check if the user with the provided email exists
        const user = await User.findOne({ email });

        if (!user) {
            // User not found
            return res.status(401).json({ message: 'User not found' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            // If login is successful, store user ID in session
            req.session.userId = user._id;
            console.log('Login successful');
            res.status(200).json({ message: 'Login successful' });
        } else {
            // Invalid password
            console.log('Invalid password');
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        // Log the error for debugging
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// ... (other routes and configurations)

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
app.post('/logout', (req, res) => {
    // Destroy the session on logout
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Logout successful' });
        }
    });
});



// ...

// Route to get the user's profile
app.get('/profile', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to update the user's profile
app.put('/profile', authenticateUser, async (req, res) => {
    try {
        const { name, address, contactDetails } = req.body;

        // Assuming you've updated the User model to include these fields
        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            { name, address, contactDetails },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to upload profile image
app.post('/profile/upload-image', authenticateUser, async (req, res) => {
    try {
        const { profileImage } = req.body;

        // Save the base64-encoded image string to the user's profileImage field
        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            { profileImage },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to upload identification proof
app.post('/profile/upload-proof', authenticateUser, async (req, res) => {
    try {
        const { identificationProof } = req.body;

        // Save the base64-encoded image string to the user's identificationProof field
        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            { identificationProof },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const questions = [
    { question: 'What does a red traffic light indicate?', options: ['Go', 'Slow down', 'Stop', 'Proceed with caution'], correctAnswer: 'c' },
    { question: 'What does a yellow traffic light indicate?', options: ['Stop', 'Proceed with caution', 'Speed up', 'Make a U-turn'], correctAnswer: 'b' },
    { question: 'What does a round sign with a red border and a white interior indicate?', options: ['Yield', 'Stop', 'No Entry', 'One-way street'], correctAnswer: 'a' },
    { question: 'When approaching a school zone, what should you do?', options: ['Increase speed', 'Use the horn to alert children', 'Slow down and watch for children', 'Ignore it, as it\'s not important'], correctAnswer: 'c' },
    { question: 'What does a solid white line between lanes mean?', options: ['Lane changing is allowed', 'Lane changing is prohibited', 'You can cross the line if necessary', 'It\'s a suggestion for lane changes'], correctAnswer: 'b' },
    { question: 'If you are being passed by another vehicle, what should you do?', options: ['Speed up to maintain your position', 'Maintain your speed and stay in your lane', 'Slow down and let the other vehicle pass safely', 'Change lanes and block the other vehicle'], correctAnswer: 'c' },
    { question: 'What is the purpose of an anti-lock braking system (ABS)?', options: ['To increase fuel efficiency', 'To prevent skidding and maintain steering control during hard braking', 'To make the brakes more responsive', 'To decrease stopping distance'], correctAnswer: 'b' },
    { question: 'What does a red triangle with an orange center indicate?', options: ['Construction zone ahead', 'School zone ahead', 'Yield ahead', 'Stop sign ahead'], correctAnswer: 'c' },
    { question: 'In adverse weather conditions, what should you do to maintain a safe following distance?', options: ['Decrease following distance', 'Increase following distance', 'Maintain the same following distance', 'Tailgate the vehicle in front'], correctAnswer: 'b' },
    { question: 'When can you pass a vehicle on the right?', options: ['Only in a no-passing zone', 'When the vehicle in front is making a left turn', 'When the vehicle in front is moving below the speed limit', 'Whenever you feel like it'], correctAnswer: 'b' },
    { question: 'What is the legal blood alcohol concentration (BAC) limit for most drivers?', options: ['0.02%', '0.05%', '0.08%', '0.10%'], correctAnswer: 'c' },
    { question: 'What is the primary purpose of traffic signs?', options: ['Decoration', 'Provide information and guidance', 'Entertainment', 'Obstruct the view'], correctAnswer: 'b' },
    { question: 'When parking uphill with a curb, which way should the front wheels be turned?', options: ['Towards the curb', 'Away from the curb', 'Parallel to the curb', 'No need to turn'], correctAnswer: 'a' },
    { question: 'What does a white rectangular sign with black lettering indicate?', options: ['Speed limit', 'Warning', 'Regulatory information', 'Destination information'], correctAnswer: 'c' },
    { question: 'What does a flashing red traffic light indicate?', options: ['Go', 'Stop', 'Proceed with caution', 'Slow down'], correctAnswer: 'b' },
    { question: 'What should you do if your vehicle starts to skid?', options: ['Accelerate', 'Brake firmly', 'Steer in the direction you want to go', 'Close your eyes'], correctAnswer: 'c' },
    { question: 'When should you use your headlights?', options: ['Only at night', 'In fog, rain, or snow', 'When approaching other vehicles', 'All of the above'], correctAnswer: 'd' },
    { question: 'What is the purpose of a crosswalk?', options: ['To decorate the road', 'To provide a safe path for pedestrians', 'To indicate a bicycle lane', 'To discourage jaywalking'], correctAnswer: 'b' },
    { question: 'What does a green arrow signal indicate?', options: ['Turn permitted', 'Stop', 'Proceed with caution', 'Yield'], correctAnswer: 'a' },
    { question: 'When should you yield the right-of-way?', options: ['Always', 'Only when turning left', 'When a pedestrian is present', 'When required by traffic signs or signals'], correctAnswer: 'd' },
    { question: 'What is the purpose of a rumble strip on the road?', options: ['To create noise for entertainment', 'To alert drivers of upcoming hazards or changes in the road', 'To mark a bicycle lane', 'To enhance road aesthetics'], correctAnswer: 'b' },
  ];
  

let scores = {};

app.get('/questions', (req, res) => {
  res.json({ questions });
});

app.post('/submit', (req, res) => {
  const userAnswers = req.body.answers;
  let score = 0;

  for (let i = 0; i < questions.length; i++) {
    if (userAnswers[i] === questions[i].correctAnswer) {
      score++;
    }
  }

  const userId = Math.random().toString(36).substring(7);
  scores[userId] = score;

  res.json({ score });
});

app.get('/scores/:userId', (req, res) => {
  const userId = req.params.userId;
  const score = scores[userId];
  res.json({ score });
});


// ... other routes and configurations

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});