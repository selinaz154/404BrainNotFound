document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way
        processFormData();
    });
});

function processFormData() {
    const gender = document.getElementById('gender').value;
    const race = document.getElementById('race').value;
    const ageRange = document.getElementById('ageRange').value;
    const married = document.getElementById('married').value;

    console.log(`Gender: ${gender}, Race: ${race}, Age Range: ${ageRange}, Married: ${married}`);
    // Here we can add more code to process and use the data
    //like try match the data here with the data files we have
    // Example: Update the chart, store the data, send it to a server, etc.
}

// Additional functions related to data processing can go here
