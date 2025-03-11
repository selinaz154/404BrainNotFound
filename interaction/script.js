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
  const jsonData = await fetchJSON("new4.json");

  // Filter data based on user inputs
  const filteredData = jsonData.filter((d) => {
    // Calculate age at the time of procedure
    const birthDate = new Date(d.BirthDate);
    const performedDate = new Date(d.PerformedStartDate);
    const ageAtProcedure = Math.abs(
      performedDate.getFullYear() - birthDate.getFullYear()
    );

    console.log(ageAtProcedure);
    // Match user inputs with data fields
    const matchesLanguage = d.Language == language;
    const matchesRace = d.Race === race;
    const matchesAge =
      ageAtProcedure >= ageRange - 10 && ageAtProcedure <= ageRange + 10;
    const matchesMaritalStatus = d.MaritalStatus === married;

    return matchesLanguage && matchesRace && matchesAge && matchesMaritalStatus;
  });

  console.log("Filtered Data:", filteredData);

  // Count occurrences of conditions
  const conditionCounts = {};
  filteredData.forEach((person) => {
    const condition = person.ConditionDescription; // Use the correct field name
    if (condition) {
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    }
  });

  // Get top 10 conditions
  const sortedConditions = Object.entries(conditionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  console.log("Top 10 Conditions:", sortedConditions);

  // Extract labels and values for the histogram
  const labels = sortedConditions.map((m) => m[0]);
  const values = sortedConditions.map((m) => m[1]);

  // Render the histogram
  renderHistogram(labels, values);
}

async function fetchJSON(filename) {
  console.log("Fetching JSON from:", filename); // Log the path to check correctness
  try {
    const response = await fetch(filename);
    console.log("Fetch response:", response);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
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
  console.log("Rendering histogram...");

  // Select the SVG container and clear any existing content
  const svg = d3
    .select("#histogramChart")
    .attr("width", 600)
    .attr("height", 400);

  svg.selectAll("*").remove(); // Clear previous chart

  // Set dimensions and margins
  const margin = { top: 50, right: 30, bottom: 70, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create main SVG group
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales
  const x = d3
    .scaleBand()
    .domain(labels) // Condition names on x-axis
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(values)]) // Counts on y-axis
    .nice()
    .range([height, 0]);

  // Add x-axis (condition names)
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)"); // Rotate labels for better readability

  // Add y-axis (counts)
  g.append("g").call(d3.axisLeft(y));

  // Add bars
  g.selectAll(".bar")
    .data(values)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => x(labels[i])) // Position bars based on condition names
    .attr("y", (d) => y(d)) // Position bars based on counts
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d)) // Height based on counts
    .attr("fill", "rgba(54, 162, 235, 0.6)")
    .attr("stroke", "rgba(54, 162, 235, 1)")
    .attr("stroke-width", 1)
    .on("mouseover", function (event, d) {
      // Show tooltip on mouseover
      const condition = labels[values.indexOf(d)];
      const count = d;
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`Condition: ${condition}<br>Count: ${count}`)
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      // Hide tooltip on mouseout
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Add chart title
  g.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Top 10 Conditions by Count");

  // Add x-axis label
  // g.append("text")
  //   .attr("x", width / 2)
  //   .attr("y", height + margin.bottom - 10)
  //   .attr("text-anchor", "middle")
  //   .text("Condition");

  // Add y-axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left)
    .attr("x", -height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Count");

  // Add a tooltip div
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("pointer-events", "none");
}
