document.addEventListener("DOMContentLoaded", function () {
  const width = 600,
    height = 400;
  const margin = { top: 20, right: 30, bottom: 50, left: 50 };

  const svg = d3
    .select("#histogramChart")
    .attr("width", width)
    .attr("height", height);

  // Show loading message
  document.getElementById("loading").style.display = "block";

  // Load both datasets
  Promise.all([
    d3.json("json/patients_medications_procedures.json"),
    d3.json("json/patient_conditions.json"),
  ]).then(([patientsData, medicationsData]) => {
    document.getElementById("loading").style.display = "none";

    let mergedData = patientsData.map((patient) => {
      let medRecord = medicationsData.find(
        (med) => med.PatientID === patient.PatientID
      );
      return { ...patient, ...medRecord };
    });

    function updateHistogram(filteredData) {
      svg.selectAll("*").remove();

      if (filteredData.length < 5) {
        document.getElementById("noDataMessage").style.display = "block";
        return;
      } else {
        document.getElementById("noDataMessage").style.display = "none";
      }

      const ages = filteredData.map(
        (d) => new Date().getFullYear() - new Date(d.BirthDate).getFullYear()
      );

      const x = d3
        .scaleLinear()
        .domain([d3.min(ages), d3.max(ages)])
        .range([margin.left, width - margin.right]);

      const histogram = d3
        .histogram()
        .domain(x.domain())
        .thresholds(x.ticks(10));

      const bins = histogram(ages);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(bins, (d) => d.length)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      svg
        .selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.x0))
        .attr("y", (d) => y(d.length))
        .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
        .attr("height", (d) => height - margin.bottom - y(d.length))
        .attr("fill", "steelblue")
        .on("mouseover", function () {
          d3.select(this).attr("fill", "orange");
        })
        .on("mouseout", function () {
          d3.select(this).attr("fill", "steelblue");
        });

      svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

      svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    }

    updateHistogram(mergedData);

    document
      .getElementById("dataForm")
      .addEventListener("submit", function (event) {
        event.preventDefault();
        const selectedRace = document.getElementById("race").value;
        const selectedAge = document.getElementById("ageRange").value;
        const selectedMarital = document.getElementById("married").value;
        const selectedMedicationStatus =
          document.getElementById("medicationStatus").value;

        let filteredData = mergedData.filter(
          (d) =>
            (selectedRace === "all" || d.Race === selectedRace) &&
            (selectedMarital === "all" ||
              d.MaritalStatus === selectedMarital) &&
            (selectedMedicationStatus === "all" ||
              d.Status === selectedMedicationStatus) &&
            new Date().getFullYear() - new Date(d.BirthDate).getFullYear() <=
              selectedAge
        );

        updateHistogram(filteredData);
      });

    document.getElementById("ageRange").addEventListener("input", function () {
      document.getElementById("ageValue").textContent = this.value;
    });
  });
});
