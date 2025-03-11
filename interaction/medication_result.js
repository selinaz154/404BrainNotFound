// Top Ten Medications
let mergedData = [];
const numChunks = 50;

async function loadAllChunks() {
  let loadPromises = [];

  for (let i = 1; i <= numChunks; i++) {
    loadPromises.push(
      d3.json(`https://selinaz154.github.io/404BrainNotFound/medication/medi_${i}.json`).then(function (chunkData) {
        mergedData = mergedData.concat(chunkData);
      })
    );
  }

  // console.log("✅ All chunks loaded successfully.");
  // processData(mergedData); // Pass data to next function
  Promise.all(loadPromises)
    .then(() => processData())
    .catch((error) => console.error("Error in loading chunks:", error));
}

function processData() {
  const conditionInput = document.getElementById("conditionInput");
  const searchButton = document.getElementById("searchButton");
  const resultsDiv = document.getElementById("results");

  function searchMedicationsByCondition(condition) {
    const filteredData = mergedData.filter((row) =>
      row.ConditionDescription.toLowerCase().includes(condition.toLowerCase())
    );

    const medicationCounts = {};
    filteredData.forEach((row) => {
      const medication = row.MedicationName;
      medicationCounts[medication] = (medicationCounts[medication] || 0) + 1;
    });

    const medicationsWithCounts = Object.entries(medicationCounts).map(
      ([medication, count]) => ({ medication, count })
    );

    medicationsWithCounts.sort((a, b) => b.count - a.count);

    return medicationsWithCounts.slice(0, 10);
  }

  function displayResults(medications) {
    resultsDiv.innerHTML = "";

    if (medications.length === 0) {
      resultsDiv.innerHTML = "<p>No medications found for this condition.</p>";
      return;
    }

    // Create a list of medications
    medications.forEach(({ medication, count }) => {
      const medicationItem = document.createElement("div");
      medicationItem.className = "medication-item";
      medicationItem.textContent = `${medication} (prescribed ${count} times)`;
      resultsDiv.appendChild(medicationItem);
    });
  }

  searchButton.addEventListener("click", () => {
    const condition = conditionInput.value.trim();
    if (condition) {
      const medications = searchMedicationsByCondition(condition);
      displayResults(medications);
    } else {
      resultsDiv.innerHTML = "<p>Please enter a condition.</p>";
    }
  });

  conditionInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      searchButton.click();
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadAllChunks();
});

// d3.text("data/cleaned_cond_medi.json").then((text) => {

//     const lines = text.split("\n");

//     const data = lines
//       .filter((line) => line.trim() !== "")
//       .map((line) => JSON.parse(line));

// const conditionInput = document.getElementById("conditionInput");
// const searchButton = document.getElementById("searchButton");
// const resultsDiv = document.getElementById("results");

// function searchMedicationsByCondition(condition) {

//   const filteredData = data.filter((row) =>
//     row.ConditionDescription.toLowerCase().includes(condition.toLowerCase())
//   );

//   const medicationCounts = {};
//   filteredData.forEach((row) => {
//     const medication = row.MedicationName;
//     medicationCounts[medication] = (medicationCounts[medication] || 0) + 1;
//   });

//   const medicationsWithCounts = Object.entries(medicationCounts).map(
//     ([medication, count]) => ({ medication, count })
//   );

//   medicationsWithCounts.sort((a, b) => b.count - a.count);

//   return medicationsWithCounts.slice(0, 10);
// }

// function displayResults(medications) {

//   resultsDiv.innerHTML = "";

//   if (medications.length === 0) {
//     resultsDiv.innerHTML = "<p>No medications found for this condition.</p>";
//     return;
//   }

//   // Create a list of medications
//   medications.forEach(({ medication, count }) => {
//     const medicationItem = document.createElement("div");
//     medicationItem.className = "medication-item";
//     medicationItem.textContent = `${medication} (prescribed ${count} times)`;
//     resultsDiv.appendChild(medicationItem);
//   });
// }

// searchButton.addEventListener("click", () => {
//   const condition = conditionInput.value.trim();
//   if (condition) {
//     const medications = searchMedicationsByCondition(condition);
//     displayResults(medications);
//   } else {
//     resultsDiv.innerHTML = "<p>Please enter a condition.</p>";
//   }
// });

// conditionInput.addEventListener("keypress", (event) => {
//   if (event.key === "Enter") {
//     searchButton.click();
//   }
// });
// }).catch((error) => {
//   console.error("Error loading or parsing the JSON file:", error);
// });
