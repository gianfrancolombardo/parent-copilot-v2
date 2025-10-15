# Parent Copilot Firebase Setup

This document explains how to set up Firebase for the Parent Copilot application and outlines the data structure used in Firestore.

## 1. Firebase Project Setup

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click on "Add project" and follow the steps to create a new project.
3.  Once your project is created, navigate to the project dashboard.
4.  Register a new web app:
    *   Click the web icon (`</>`) to start the setup.
    *   Give your app a nickname (e.g., "Parent Copilot Web").
    *   You don't need to set up Firebase Hosting at this stage.
    *   Firebase will provide you with a configuration object. You will use these values for your environment variables.
5.  Enable Firestore:
    *   In the left-hand menu, go to "Build" > "Firestore Database".
    *   Click "Create database".
    *   Start in **test mode** for initial development. This allows open read/write access. **For production, you must configure security rules.**
    *   Choose a location for your database.

## 2. Environment Variables

The application is configured to use environment variables for Firebase configuration and the AI provider API key. The code expects these to be available on `process.env`. To be exposed to the client-side application, all variables **must** be prefixed with `REACT_APP_`.

The application supports both Google Gemini and OpenAI as AI providers.

-   **To use OpenAI (Recommended):** Set the `REACT_APP_OPENAI_API_KEY`. The app will use `gpt-5-mini`. This provider is prioritized if both keys are present.
-   **To use Gemini:** Set the `REACT_APP_API_KEY`. This will be used as a fallback if `REACT_APP_OPENAI_API_KEY` is not set.
-   If neither key is provided, the AI features will be disabled and will show an error message in the chat.

**Required Variables:**

```
REACT_APP_FIREBASE_API_KEY="AIzaSyDwV7pnHfvIJPKfANnB5N2io9UqdOvWvvU"
REACT_APP_FIREBASE_AUTH_DOMAIN="parents-copilot.firebaseapp.com"
REACT_APP_FIREBASE_PROJECT_ID="parents-copilot"
REACT_APP_FIREBASE_STORAGE_BUCKET="parents-copilot.appspot.com"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="86922263005"
REACT_APP_FIREBASE_APP_ID="1:86922263005:web:a76064cb815e9993435e34"

# Choose your AI provider(s)
REACT_APP_API_KEY="YOUR_GEMINI_API_KEY"
REACT_APP_OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

## 3. Firestore Data Structure

Firestore is a NoSQL document database. Our data is organized into collections, which contain documents.

### `children` collection

This collection stores a document for each child added to the app.

-   **Path:** `/children/{childId}`
-   **Document Fields:**
    -   `name` (string): The child's name.
    -   `birthDate` (string): The child's date of birth in ISO format (e.g., "2023-05-15").
    -   `createdAt` (Timestamp): A Firestore timestamp of when the record was created.

### `insights` collection

This collection stores all the developmental insights generated for all children.

-   **Path:** `/insights/{insightId}`
-   **Document Fields:**
    -   `childId` (string): A reference to the child's document ID in the `children` collection.
    -   `category` (string): e.g., "Motor", "Language".
    -   `title` (string): The title of the insight.
    -   `observation` (string): The observation text.
    -   `recommendation` (string): The recommendation text.
    -   `status` (string): e.g., "on_track", "excellent".
    -   `iconName` (string): The name of the icon to display.
    -   `type` (string): 'observation' or 'stimulation'.
    -   `createdAt` (Timestamp): A Firestore timestamp of when the insight was created.

### `messages` collection

This collection stores the chat history for each child. Each child has a document, which in turn has a `history` subcollection for their messages.

-   **Path:** `/messages/{childId}/history/{messageId}`
-   **Document Fields:**
    -   `role` (string): "user" or "assistant".
    -   `content` (string): The text of the message.
    -   `questionCategory` (string, optional): The category of the assistant's question.
    -   `createdAt` (Timestamp): A Firestore timestamp of when the message was sent.