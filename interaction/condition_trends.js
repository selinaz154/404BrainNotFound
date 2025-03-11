document.addEventListener("DOMContentLoaded", function () {
  fetch("https://selinaz154.github.io/404BrainNotFound/new4.json")
    .then((response) => response.json())
    .then((data) => processData(data))
    .catch((error) => console.error("Error loading JSON data:", error));

  function processData(data) {
    const ageGroups = {
      "0-20": {},
      "21-40": {},
      "41-60": {},
      "61+": {},
    };

    // Categorize conditions into age groups
    data.forEach((patient) => {
      const age = Math.abs(
        new Date(patient.PerformedStartDate).getFullYear() -
          new Date(patient.BirthDate).getFullYear()
      );
      let ageGroup;
      if (age <= 20) ageGroup = "0-20";
      else if (age <= 40) ageGroup = "21-40";
      else if (age <= 60) ageGroup = "41-60";
      else ageGroup = "61+";

      const condition = patient.ConditionDescription;
      if (!ageGroups[ageGroup][condition]) {
        ageGroups[ageGroup][condition] = 0;
      }
      ageGroups[ageGroup][condition]++;
    });

    // Get the top 10 most common conditions across all age groups
    const allConditions = {};
    Object.values(ageGroups).forEach((group) => {
      Object.entries(group).forEach(([condition, count]) => {
        allConditions[condition] = (allConditions[condition] || 0) + count;
      });
    });

    const topConditions = Object.entries(allConditions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([condition]) => condition);

    // Filter the data to only include the top 10 conditions
    Object.keys(ageGroups).forEach((ageGroup) => {
      Object.keys(ageGroups[ageGroup]).forEach((condition) => {
        if (!topConditions.includes(condition)) {
          delete ageGroups[ageGroup][condition];
        }
      });
    });

    // Convert to an array for D3
    const stackedData = Object.keys(ageGroups).map((ageRange) => ({
      ageGroup: ageRange,
      ...ageGroups[ageRange],
    }));

    renderStackedBarChart(stackedData, topConditions);
  }

  function renderStackedBarChart(stackedData, topConditions) {
    const svgWidth = 700,
      svgHeight = 500;
    const margin = { top: 50, right: 200, bottom: 70, left: 100 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3
      .select("#stackedBarChartContainer")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Stack layout
    const stack = d3.stack().keys(topConditions);
    const stackedSeries = stack(stackedData);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(stackedData.map((d) => d.ageGroup))
      .range([0, width])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(stackedSeries[stackedSeries.length - 1], (d) => d[1])])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Draw bars with animation
    const bars = svg
      .append("g")
      .selectAll("g")
      .data(stackedSeries)
      .enter()
      .append("g")
      .attr("fill", (d) => color(d.key))
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.data.ageGroup))
      .attr("y", height) // Start from bottom
      .attr("height", 0) // Initially no height
      .attr("width", xScale.bandwidth())
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("y", (d) => yScale(d[1]))
      .attr("height", (d) => yScale(d[0]) - yScale(d[1]));

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-40)");

    // Y Axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text("Aging: Conditions by Age Group");

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + 20}, 20)`)
      .selectAll("g")
      .data(topConditions)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legend
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => color(d));

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .text((d) => (d.length > 15 ? d.substring(0, 15) + "..." : d)); // Truncate if too long
  }
});
