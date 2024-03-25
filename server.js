
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); 
const https = require('https');

const transcriptUsernames = ['Sarah', 'Malaika']

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

async function uploadTranscriptToCloudinary(combinedTranscript) {
    try {
        const cloudinaryUploadResult = await cloudinary.uploader.upload_stream(
            { resource_type: 'raw', folder: 'combinedTranscript', public_id: 'combined_transcripts' },
            (error, result) => {
                if (error) {
                    console.error('Error uploading text to Cloudinary:', error);
                } else {
                    console.log('Text upload to Cloudinary successful:', result);
                }
            }
        ).end(combinedTranscript);

        return cloudinaryUploadResult;
    } catch (error) {
        console.error('Error uploading text to Cloudinary:', error);
        throw error;
    }
}



//COMBINE TRANSCRIPT

app.post('/combineTranscripts', async (req, res) => {
    try {
        
        const transcripts =await combineTranscripts(); // Execute the combineTranscripts method
        
        if(transcripts!==null){
            console.log("TRANSCRIPT CREATED IN Server.JS");
            console.log(transcripts);
            // Upload the combined transcripts text to Cloudinary
            const cloudinaryUploadResult = await uploadTranscriptToCloudinary(transcripts);
            console.log("Cloudinary upload result:", cloudinaryUploadResult);

            res.status(200).json({ success: true, cloudinaryUploadResult });
            
        }
        else{
            res.status(500).send('Error combining transcripts');
            console.error("couldn't combine");
        }

    } catch (error) {
        console.error('Error combining transcripts:', error);
        res.status(500).send('Error combining transcripts');
    }
});

// Function to fetch transcript data from HTTP links for a given username
function fetchTranscriptData(username) {
    return new Promise((resolve, reject) => {
        const url = `https://res.cloudinary.com/drf5xu4vy/raw/upload/v1711373576/${username}_transcript.txt`;
        https.get(url, res => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({ username, data });
            });

            res.on('error', err => {
                reject(err);
            });
        });
    });
}


async function combineTranscripts() {
    let combinedTranscripts = [];
    
    // Fetch transcripts for all users
    for (const username of transcriptUsernames) {
        try {
            const { username: fetchedUsername, data } = await fetchTranscriptData(username);
            
            // Extract timestamp and text from each line
            data.split('\n').forEach(line => {
                if (line.trim().length > 0) {
                    const [timestampString, ...textParts] = line.split(' - ');
                    const timestamp = new Date(timestampString);
                    const text = textParts.join(' - ');
                    
                    // Push the message to combinedTranscripts
                    combinedTranscripts.push({ username: fetchedUsername, timestamp, text });
                }
            });
        } catch (error) {
            console.error(`Error fetching transcript for ${username}: ${error}`);
        }
    }

    // Sort combined transcripts by timestamp
    combinedTranscripts.sort((a, b) => a.timestamp - b.timestamp);
    
    // Construct the output string
    let output = '';
    combinedTranscripts.forEach(transcript => {
        output += `${transcript.username}:\n\n${transcript.text}\n\n`;
    });
    
    return output;
}






// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
