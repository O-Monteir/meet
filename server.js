
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
dotenv.config();

app.use(express.static('public'));
app.use(express.json());

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './temp'); // Store files in a temporary directory
    },
    filename: function (req, file, cb) {
        const username = req.body.username;
        const fileName = `${username}_transcript.txt`;
        cb(null, fileName); // Use the username as part of the filename
    }
});

const upload = multer({ storage: storage });

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Handle file uploads
app.post('/upload', upload.single('transcript'), async (req, res) => {
    console.log(req.file);
    try {
        const transcript = req.body.transcript; // Get the transcript string from the request body
        const username = req.body.username;

        // Check if transcript exists
        if (!transcript || !username) {
            console.error("Error: No transcript or username uploaded.");
            return res.status(400).json({ error: "No transcript or username uploaded." });
        }

        // Create a temporary text file with the transcript content
        const fileName = `${username}_transcript.txt`;
        const filePath = `./temp/${fileName}`;
        fs.writeFileSync(filePath, transcript);

        // Upload the text file to Cloudinary
        const uploadResult = await uploadToCloudinary(filePath,username);

        // Delete the temporary text file
        fs.unlinkSync(filePath);

        console.log("Upload result:", uploadResult);
        res.json(uploadResult); // Respond with the upload result
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'An error occurred while uploading file.' });
    }
});

// Function to upload file to Cloudinary
async function uploadToCloudinary(filePath, username) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {resource_type: "raw",public_id: `${username}_transcript`}); // Upload the file to Cloudinary
        return result;
    } catch (error) {
        throw error;
    }
}

//COMBINE TRANSCRIPT

// Function to fetch transcript files from Cloudinary based on usernames
async function fetchTranscriptFiles() {
    try {
        const result = await cloudinary.search
            .expression('resource_type:raw tags:transcript')
            .execute();

        const transcripts = result.resources.map(resource => ({
            username: getUsernameFromFilename(resource.filename),
            url: resource.secure_url // Assuming you store the transcript files in Cloudinary
        }));

        return transcripts;
    } catch (error) {
        console.error('Error fetching transcript files from Cloudinary:', error);
        throw error;
    }
}

// Function to combine transcripts
async function combineTranscripts() {
    try {
        const transcripts = await fetchTranscriptFiles();
        let combinedTranscript = '';
        // Your code to combine transcripts goes here
        // ...
        // Once combined, you may want to save the combined transcript to a file or return it as a response
        
        // Example: Saving to a file
        fs.writeFileSync('combined_transcripts.txt', 'Combined transcripts content...');
        
        // Example: Returning as a response (you can adjust the response based on your requirements)
        return 'Combined transcripts successfully!';
    } catch (error) {
        console.error('Error combining transcripts:', error);
        throw error;
    }
}

// Endpoint to trigger the transcript combining process
app.get('/combineTranscripts', async (req, res) => {
    try {
        const result = await combineTranscripts();
        res.send(result);
    } catch (error) {
        res.status(500).send('Error combining transcripts');
    }
});


// Function to extract username from filename
function getUsernameFromFilename(filename) {
    return filename.split('_')[0];
}



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
