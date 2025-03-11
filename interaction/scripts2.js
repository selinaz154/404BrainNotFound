document.addEventListener("DOMContentLoaded", function () {
  // Initially render the top 10 conditions graph
  loadDefaultGraph();

  const form = document.getElementById("dataForm");
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form from submitting traditionally
    processFormData(); // Handle the form data and update the graph
  });
});

// Function to load and render the default graph (top 10 conditions from all data)
async function loadDefaultGraph() {
  const jsonData = await fetchJSON(
    "https://selinaz154.github.io/404BrainNotFound/new4.json"
  );

  // Count occurrences of conditions in the entire dataset
  const conditionCounts = {};
  jsonData.forEach((person) => {
    const condition = person.ConditionDescription; // Use the correct field name
    if (condition) {
      conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
    }
  });

  // Get top 10 conditions
  const sortedConditions = Object.entries(conditionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log("Top 10 Conditions (Default):", sortedConditions);

  // Extract labels and values for the histogram
  const labels = sortedConditions.map((m) => m[0]);
  const values = sortedConditions.map((m) => m[1]);

  // added new HERE
  const noDataMessage = document.getElementById("noDataMessage");
  if (sortedConditions.length === 0) {
    noDataMessage.style.display = "block"; // Show the message if no data
  } else {
    noDataMessage.style.display = "none"; // Hide the message if there is data
  }

  // Render the histogram
  renderHistogram(labels, values);
}

async function processFormData() {
  // Get user inputs
  const race = document.getElementById("race").value;
  const ageRange = parseInt(document.getElementById("age").value, 10);
  const married = document.getElementById("married").value;
  const language = document.getElementById("language").value;

  console.log(
    `Language: ${language}, Race: ${race}, Age Range: ${ageRange}, Married: ${married}`
  );

  // Fetch JSON data
  const jsonData = await fetchJSON(
    "https://selinaz154.github.io/404BrainNotFound/new4.json"
  );

  // Filter data based on user inputs
  const filteredData = jsonData.filter((d) => {
    // Calculate age at the time of procedure
    const birthDate = new Date(d.BirthDate);
    const performedDate = new Date(d.PerformedStartDate);
    let ageAtProcedure = performedDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = performedDate.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && performedDate.getDate() < birthDate.getDate())
    ) {
      ageAtProcedure--;
    }

    // Match user inputs with data fields
    const matchesLanguage = language === "all" || d.Language === language;
    const matchesRace = race === "all" || d.Race === race;
    const matchesAge =
      ageAtProcedure >= ageRange - 10 && ageAtProcedure <= ageRange + 10;
    const matchesMaritalStatus =
      married === "all" || d.MaritalStatus === married;

    return matchesLanguage && matchesRace && matchesAge && matchesMaritalStatus;
  });

  // if (filteredData.length === 0) {
  //   alert("No data available for the selected filters.");
  //   return; // Prevent rendering the graph if no data matches
  // }

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

  // added new HERE
  const noDataMessage = document.getElementById("noDataMessage");
  if (sortedConditions.length === 0) {
    noDataMessage.style.display = "block"; // Show the message if no data
  } else {
    noDataMessage.style.display = "none"; // Hide the message if there is data
  }

  // Render the histogram with the filtered data
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
    .call(d3.axisBottom(x).ticks(0))
    .selectAll(".tick")
    .remove();

  // Add y-axis (counts)
  g.append("g").call(d3.axisLeft(y));

  // Add bars
  const bars = g
    .selectAll(".bar")
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
    .attr("stroke-width", 1);
  //   .on("mouseover", function (event, d) {
  //     // Show tooltip on mouseover
  //     const condition = labels[values.indexOf(d)];
  //     const count = d;
  //     tooltip.transition().duration(200).style("opacity", 0.9);
  //     tooltip
  //       .html(`Condition: ${condition}<br>Count: ${count}`)
  //       .style("left", event.pageX + 5 + "px")
  //       .style("top", event.pageY - 28 + "px");
  //   })
  //   .on("mouseout", function (d) {
  //     // Hide tooltip on mouseout
  //     tooltip.transition().duration(500).style("opacity", 0);
  //   });

  // Add chart title
  g.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Top 10 Conditions by Count");

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
    .style("pointer-events", "none")
    .style("user-select", "text");

  let selectedBar = null;

  bars.on("click", function (event, d) {
    const condition = labels[values.indexOf(d)];
    const count = d;
    const currentBar = d3.select(this); // Get the clicked bar

    // If the same bar is clicked again, unhighlight it and hide the tooltip
    if (selectedBar === currentBar.node()) {
      // Unhighlight the current bar
      currentBar
        .classed("selected", false)
        .attr("fill", "rgba(54, 162, 235, 0.6)"); // Revert color

      // Hide the tooltip
      tooltip
        .transition()
        .duration(500)
        .style("opacity", 0)
        .style("visibility", "hidden")
        .style("pointer-events", "none");

      // Reset the selected bar
      selectedBar = null;
      return;
    }

    // Unhighlight the previously selected bar if there is one
    if (selectedBar) {
      d3.select(selectedBar)
        .classed("selected", false)
        .attr("fill", "rgba(54, 162, 235, 0.6)"); // Revert color of the previous bar
    }

    // Highlight the newly selected bar
    currentBar
      .classed("selected", true)
      .attr("fill", "rgba(255, 99, 132, 0.8)"); // Highlight color for the selected bar

    // Update the currently selected bar reference
    selectedBar = currentBar.node();

    // Show the tooltip for the newly selected bar
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0.9)
      .style("visibility", "visible")
      .style("pointer-events", "auto");
    tooltip
      .html(`Condition: ${condition}<br>Count: ${count}`)
      .style("left", event.pageX + 5 + "px")
      .style("top", event.pageY - 28 + "px");
  });

  d3.select("body").on("click", function (event) {
    if (
      !d3.select(event.target).classed("bar") &&
      !d3.select(event.target).classed("tooltip") &&
      !tooltip.node().contains(event.target)
    ) {
      tooltip
        .transition()
        .duration(500)
        .style("opacity", 0)
        .style("visibility", "hidden")
        .style("pointer-events", "none");
    }
  });
}
