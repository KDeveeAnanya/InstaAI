document.getElementById('generateBtn').addEventListener('click', function() {
    const numCreatives = parseInt(document.getElementById('numCreatives').value);
    const creativeType = document.getElementById('creativeType').value;
    const numSlides = parseInt(document.getElementById('numSlides').value);
    const reelDuration = parseInt(document.getElementById('reelDuration').value);

    const contentTableBody = document.getElementById('contentTable').getElementsByTagName('tbody')[0];
    contentTableBody.innerHTML = ''; // Clear existing table content

    const generatedContent = []; // To track unique content
    const generatedHashtags = []; // To track unique hashtags

    // Helper functions to generate unique content
    function generateUniqueContent(type, index, numSlides, reelDuration) {
        let content = "";
        let copy = "";

        const words = ["amazing", "awesome", "beautiful", "best", "cool", "cute", "fantastic", "great", "happy", "inspiring"];
        const phrases = ["Check out this", "What do you think of this", "Let me know your thoughts on", "I'm excited to share this", "This is my favorite"];

        if (type === 'post' || type === 'carousel') {
            for (let i = 0; i < numSlides; i++) {
                let randomWord1 = words[Math.floor(Math.random() * words.length)];
                let randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
                let slideContent = randomPhrase + " " + randomWord1 + " slide " + (i + 1) + " in " + type + " " + index;
                content += slideContent + "<br>";
                copy += slideContent + " --- ";
            }
        } else if (type === 'reel') {
            content = "Reel script for " + index + " (duration: " + reelDuration + "s)";
            let numScenes = Math.floor(reelDuration / 5); // Assume each scene is 5 seconds long
            let reelScript = "";
            for (let i = 0; i < numScenes; i++) {
                reelScript += "Scene " + (i + 1) + ": [Description - " + words[Math.floor(Math.random() * words.length)] + "] ";
            }
            copy = reelScript;
        } else {
            content = "Mixed content " + index;
            copy = "Mixed content copy " + index;
        }

        // Ensure uniqueness
        while (generatedContent.includes(content)) {
            content += " (modified)";
        }
        generatedContent.push(content);
        return { content: content, copy: copy };
    }

    function generateUniqueHashtags() {
        const allHashtags = ["#amazing", "#awesome", "#beautiful", "#bestoftheday", "#cool", "#cute", "#fashion", "#follow", "#followme", "#food", "#fun", "#happy", "#igers", "#instagood", "#instalike", "#instamood", "#love", "#me", "#photooftheday", "#picoftheday", "#smile", "#style", "#summer", "#sun", "#travel"];
        const selectedHashtags = [];
        while (selectedHashtags.length < 10) {
            const randomIndex = Math.floor(Math.random() * allHashtags.length);
            const hashtag = allHashtags[randomIndex];
            if (!selectedHashtags.includes(hashtag)) {
                selectedHashtags.push(hashtag);
            }
        }
        const hashtagsString = selectedHashtags.join(" ");

        // Ensure uniqueness
        let uniqueHashtagsString = hashtagsString;
        while (generatedHashtags.includes(uniqueHashtagsString)) {
            uniqueHashtagsString = selectedHashtags.sort(() => Math.random() - 0.5).join(" "); // Shuffle if duplicate
        }
        generatedHashtags.push(uniqueHashtagsString);
        return uniqueHashtagsString;
    }

    function generateEngagingCaption(type, content) {
        return "Check out this " + type + " with " + content + "! #engagement";
    }

    for (let i = 0; i < numCreatives; i++) {
        let row = contentTableBody.insertRow();
        let creativeTypeCell = row.insertCell();
        let contentCell = row.insertCell();
        let hashtagsCell = row.insertCell();
        let captionCell = row.insertCell();
        let copyCell = row.insertCell();
        let designCell = row.insertCell();

        let currentCreativeType = creativeType === 'mixed' ? ['post', 'carousel', 'reel'][Math.floor(Math.random() * 3)] : creativeType;
        creativeTypeCell.innerHTML = currentCreativeType;

        const generated = generateUniqueContent(currentCreativeType, i + 1, numSlides, reelDuration);
        contentCell.innerHTML = generated.content;
        copyCell.innerHTML = generated.copy;

        const hashtags = generateUniqueHashtags();
        hashtagsCell.innerHTML = hashtags;

        const caption = generateEngagingCaption(currentCreativeType, generated.content);
        captionCell.innerHTML = caption;

        designCell.innerHTML = "Eye-catching design " + (i + 1); // Placeholder
    }
});

document.getElementById('creativeType').addEventListener('change', function() {
    const creativeType = this.value;
    const numSlidesDiv = document.getElementById('numSlides').parentNode;
    const reelDurationDiv = document.getElementById('reelDuration').parentNode;

    if (creativeType === 'post' || creativeType === 'carousel') {
        numSlidesDiv.style.display = 'block';
        reelDurationDiv.style.display = 'none';
    } else if (creativeType === 'reel') {
        numSlidesDiv.style.display = 'none';
        reelDurationDiv.style.display = 'block';
    } else {
        numSlidesDiv.style.display = 'none';
        reelDurationDiv.style.display = 'none';
    }
});

// Initially hide the numSlides and reelDuration input fields
document.getElementById('numSlides').parentNode.style.display = 'none';
document.getElementById('reelDuration').parentNode.style.display = 'none';

document.getElementById('excelBtn').addEventListener('click', function() {
    // Get table data
    const table = document.getElementById('contentTable');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, "Content");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "creative_content.xlsx");
});
