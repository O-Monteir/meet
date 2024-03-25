// const fs = require('fs');
// const path = require('path');

// const transcriptDir = 'transcript/';
// const outputFilePath = 'combined_transcripts.txt'; // Path for the output TXT file

// // Function to read transcript files and combine them
// function combineTranscripts() {
//     let combinedTranscripts = [];
//     let lastSpeaker = null; // Track the last speaker
//     let speakerTimestamps = {}; // Store the timestamp of the last message in each speaker's section

//     // Read each file in the directory
//     fs.readdirSync(transcriptDir).forEach(filename => {
//         if (filename.endsWith('_transcript.txt')) {
//             const speakerName = filename.split('_')[0]; // Extract speaker name from filename
//             const filepath = path.join(transcriptDir, filename);
//             const data = fs.readFileSync(filepath, 'utf8').split('\n');
            
//             // Extract timestamp and text from each line
//             data.forEach(line => {
//                 if (line.trim().length > 0) {
//                     const [timestampString, ...textParts] = line.split(' - ');
//                     const timestamp = new Date(timestampString);
//                     const text = textParts.join(' - ');

//                     // If the speaker's timestamp already exists, increment milliseconds to ensure uniqueness
//                     if (speakerTimestamps[speakerName] && timestamp <= speakerTimestamps[speakerName]) {
//                         timestamp.setMilliseconds(timestamp.getMilliseconds() + 1);
//                     }

//                     combinedTranscripts.push({ speaker: speakerName, timestamp, text });

//                     // Update the timestamp of the last message in the speaker's section
//                     speakerTimestamps[speakerName] = timestamp;
//                 }
//             });
//         }
//     });

//     // Sort combined transcripts by timestamp
//     combinedTranscripts.sort((a, b) => a.timestamp - b.timestamp);

//     // Write combined transcripts to the TXT file
//     // const stream = fs.createWriteStream(outputFilePath);

//     // combinedTranscripts.forEach(transcript => {
//     //     // If the speaker is different from the last speaker, add speaker's name and timestamp
//     //     if (transcript.speaker !== lastSpeaker) {
//     //         stream.write(`${transcript.speaker}: ${transcript.timestamp.toISOString()}\n\n`);
//     //         // Update the last speaker
//     //         lastSpeaker = transcript.speaker;
//     //     }
//     //     // Write the message text
//     //     stream.write(`${transcript.text}\n\n`);
//     // });

//     // stream.end();

//     // Write combined transcripts to the TXT file
//     const stream = fs.createWriteStream(outputFilePath);

//     combinedTranscripts.forEach(transcript => {
//         // If the speaker is different from the last speaker, add speaker's name
//         if (transcript.speaker !== lastSpeaker) {
//             stream.write(`${transcript.speaker}:\n\n`);
//             // Update the last speaker
//             lastSpeaker = transcript.speaker;
//         }
//         // Write the message text only
//         stream.write(`${transcript.text}\n\n`);
//     });

//     stream.end();

//     console.log(`Combined transcripts saved to: ${outputFilePath}`);

// }

// combineTranscripts();

async function startTranscriptCombining() {
    try {
        const response = await fetch('/combineTranscripts');
        if (response.ok) {
            console.log('Transcripts combining process started successfully!');
            // Optionally, you can handle the response here
        } else {
            console.error('Failed to start transcripts combining process:', response.statusText);
        }
    } catch (error) {
        console.error('Error starting transcripts combining process:', error);
    }
}

// Event listener for the download button
document.getElementById('download-btn').addEventListener('click', startTranscriptCombining);