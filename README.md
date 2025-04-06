# Focus.AI - Optometry Study Platform

An AI-powered study platform for optometry students, featuring:

- AI Assistant for answering optometry questions
- Case Study Generator for clinical practice
- Study Notes with AI generation
- Practice Quizzes
- Syllabus tracking
- Resource library

## Deployment to Netlify

### Prerequisites

1. A GitHub account
2. A Netlify account
3. (Optional) A Google Gemini API key for enhanced AI features

### Deployment Steps

1. **Fork or clone this repository to your GitHub account**

2. **Connect to Netlify**
   - Log in to your Netlify account
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy site"

3. **Environment Variables (Optional)**
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add the following variable:
     - `GEMINI_API_KEY`: Your Google Gemini API key

4. **Enable Netlify Functions**
   - Netlify will automatically detect and deploy the functions in the `netlify/functions` directory

5. **Redeploy**
   - Trigger a new deployment to apply the environment variables

### Local Development

1. Clone the repository
2. Install dependencies:

