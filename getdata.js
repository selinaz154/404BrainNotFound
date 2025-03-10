document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("dataForm");
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form from submitting traditionally
    processFormData();
  });
});

async function processFormData() {
  // Get user inputs
  const race = document.getElementById("race").value;
  const ageRange = parseInt(document.getElementById("ageRange").value, 10);
  const married = document.getElementById("married").value;
  const language = document.getElementById("language").value;

  console.log(
    `Language: ${language}, Race: ${race}, Age Range: ${ageRange}, Married: ${married}`
  );

  // Fetch JSON data
  const jsonData = await fetchJSON(
    "./json/patients_medications_procedures.json"
  );

  // Filter data based on user inputs
  const filteredData = jsonData.filter((d) => {
    // Calculate age at the time of procedure
    const birthDate = new Date(d.BirthDate);
    const performedDate = new Date(d.PerformedStartDate);
    const ageAtProcedure =
      performedDate.getFullYear() - birthDate.getFullYear();

    // Match user inputs with data fields
    const matchesLanguage = d.Language === language;
    const matchesRace = d.Ethnicity === race;
    const matchesAge =
      ageAtProcedure >= ageRange - 10 && ageAtProcedure <= ageRange + 10;
    const matchesMaritalStatus = d.MaritalStatus === married;
    console.log("Filtered Data:", matchesRace);

    return matchesLanguage && matchesRace && matchesAge && matchesMaritalStatus;
  });

  console.log("Filtered Data:", filteredData);

  // Count occurrences of medication
  const medicationCounts = {};
  filteredData.forEach((person) => {
    const medication = person.MedicationName; // Use the correct field name
    if (medication) {
      medicationCounts[medication] = (medicationCounts[medication] || 0) + 1;
    }
  });

  // Get top 10 medications
  const sortedMedications = Object.entries(medicationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Prepare data for chart
  const labels = sortedMedications.map((entry) => entry[0]); // Medication names
  const values = sortedMedications.map((entry) => entry[1]); // Frequency counts

  // Render histogram chart
  renderHistogram(labels, values);
}

async function fetchJSON(filename) {
  console.log("Fetching JSON from:", filename); // Log the path to check correctness
  try {
    const response = await fetch(filename);
    console.log("Fetch response:", response);
    if (!response.ok) {
      throw new Error(` ${response.status}`);
    }

    const jsonData = await response.json();
    console.log("Loaded JSON Data:", jsonData); // Check if data is loaded correctly
    return jsonData;
  } catch (e) {
    console.error("Error fetching JSON: ", e);
    return []; // Return an empty array in case of error
  }
}

function renderHistogram(labels, values) {
  const ctx = document.getElementById("histogramChart").getContext("2d");

  if (window.myChart) {
    window.myChart.destroy(); // Destroy previous chart instance
  }

  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Top 10 Medications",
          data: values,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
