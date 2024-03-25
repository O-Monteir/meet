document.getElementById('download-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/combineTranscripts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // You can send any necessary data in the body if required
        });
        
        if (response.ok) {
            // Get the JSON response from the server
            const responseData = await response.json();
            
            // Extract combined transcripts string from the response data
            const combinedTranscriptsString = responseData.transcripts;

            console.log("NOTICE")
            console.log(combinedTranscriptsString);
            // Initiate download
            const blob = new Blob([combinedTranscriptsString], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'combined_transcripts.txt';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            // Handle error response
            console.error('Error combining transcripts:', response.statusText);
        }
    } catch (error) {
        console.error('Error combining transcripts:', error.message);
    }
});
