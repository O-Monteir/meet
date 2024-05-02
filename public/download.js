async function fetchMeetingMinutes() {
    console.log("SECOND");
    
   
    const response = await fetch('http://127.0.0.1:5000/summarize');
       
}

document.getElementById('download-btn').addEventListener('click', async () => {
    try {
  
        console.log("START")
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
            
            // // Extract combined transcripts string from the response data
            // const combinedTranscriptsString = responseData.transcripts;

            // console.log("NOTICE")
            // console.log(combinedTranscriptsString);
            // // Initiate download
            // const blob = new Blob([combinedTranscriptsString], { type: 'text/plain' });
            // const url = window.URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = 'combined_transcripts.txt';
            // document.body.appendChild(a);
            // a.click();
            // window.URL.revokeObjectURL(url);
            // downloadPdf(pdfUrl);
            callPythonFunction()
        } else {
            // Handle error response
            console.error('Error in combining transcripts (download.js): ', response.statusText);
            callPythonFunction()
        }
    } catch (error) {
        console.error('Error: ', error.message);
        callPythonFunction()
       
    }
});


function callPythonFunction() {
    fetch("https://meet-summarization.onrender.com/summarize")
        .then(response => response.json()) // Parse response as JSON
        .then(data => {
            const pdfUrl = data.url; // Extract URL from JSON response
            downloadPdf(pdfUrl); // Call downloadPdf function with the URL
        })
        .catch(error => console.error('Error:', error));
}

// Function to download the PDF file
const downloadPdf = (url) => {
    // Create an anchor element
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = url;
    anchor.download = url.split('/').pop(); // Extract filename from URL
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
};



