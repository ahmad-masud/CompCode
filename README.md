
# CompCode

CompCode is a web application designed to help you prepare for coding interviews by solving commonly asked LeetCode problems from various popular companies. The app provides a user-friendly interface to browse, solve, and track your progress on these problems.

## Features

- **Company-Specific Problems**: View and solve problems that are frequently asked by specific companies.
- **Progress Tracking**: Track which problems you have completed.
- **Search and Sort**: Search for problems by ID or title and sort problems by different criteria (ID, title, acceptance rate, difficulty, frequency).
- **User Authentication**: Log in using Google or GitHub to save your progress.
- **Dark/Light Mode**: Automatic theme adjustment based on system preferences with manual override options.
- **Responsive Design**: Fully responsive design to accommodate different screen sizes and devices.

## Getting Started

### Prerequisites

- Node.js (v14.x or later)
- Firebase project set up for authentication and Firestore
- GitHub OAuth app set up for authentication

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/ahmad-masud/CompCode.git
   cd CompCode
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Firebase configuration:**
   - Create a \`firebase-config.js\` file in the \`src/config\` directory.
   - Add your Firebase configuration:
     \`\`\`javascript
     import { initializeApp } from 'firebase/app';
     import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
     import { getFirestore } from 'firebase/firestore';

     const firebaseConfig = {
       apiKey: 'YOUR_API_KEY',
       authDomain: 'YOUR_AUTH_DOMAIN',
       projectId: 'YOUR_PROJECT_ID',
       storageBucket: 'YOUR_STORAGE_BUCKET',
       messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
       appId: 'YOUR_APP_ID',
     };

     const app = initializeApp(firebaseConfig);
     const auth = getAuth(app);
     const googleProvider = new GoogleAuthProvider();
     const githubProvider = new GithubAuthProvider();
     const firestore = getFirestore(app);

     export { auth, googleProvider, githubProvider, firestore };
     \`\`\`

4. **Set up environment variables:**
   - Create a \`.env\` file in the root directory.
   - Add your environment variables:
     \`\`\`env
     REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
     \`\`\`

5. **Run the application:**
   \`\`\`bash
   npm start
   \`\`\`

## License
Distributed under the MIT License. See [MIT License](LICENSE) for more information.
