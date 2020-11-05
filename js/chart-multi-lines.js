var data = [{"date":2018-01-01,"醫療":0.16666666666666666,"食物環境安全":0.25,"養生保健":0.36585365853658536},{"date":2018-02-01,"醫療":0.125,"食物環境安全":0.3,"養生保健":0.26666666666666666},{"date":2018-03-01,"同性戀":0.75,"醫療":0.22857142857142856,"食物環境安全":0.3333333333333333,"養生保健":0.2894736842105263},{"date":2018-04-01,"醫療":0.35714285714285715,"養生保健":0.21052631578947367},{"date":2018-05-01,"衛生宣導":0.5,"醫療":0.47058823529411764,"食物環境安全":0.2222222222222222,"養生保健":0.1568627450980392},{"date":2018-06-01,"同性戀":0.25,"醫療":0.19230769230769232,"食物環境安全":0.2222222222222222,"養生保健":0.4074074074074074},{"date":2018-07-01,"醫療":0.20689655172413793,"食物環境安全":0.23529411764705882,"養生保健":0.15625},{"date":2018-08-01,"同性戀":0.75,"醫療":0.325,"食物環境安全":0.3125,"養生保健":0.09523809523809523},{"date":2018-09-01,"醫療":0.4090909090909091,"食物環境安全":0.16666666666666666,"養生保健":0.39285714285714285},{"date":2018-10-01,"醫療":0.4,"食物環境安全":0.5,"養生保健":0.2},{"date":2018-11-01,"同性戀":0.5,"醫療":0.5333333333333333,"食物環境安全":0.6666666666666666,"養生保健":0.07246376811594203},{"date":2018-12-01,"醫療":0.4,"食物環境安全":0.14285714285714285,"養生保健":0.4418604651162791},{"date":2019-01-01,"同性戀":0.25,"醫療":0.14814814814814814,"養生保健":0.14285714285714285}];

const columns = ["1", "2", "3", "4", "5", "date"];
const mwidth = 600;
const mheight = 400;
const margin = ({top: -30, right: 50, bottom: 30, left: 30});
const labelPadding = 6;

const series = columns.slice(1).map(key => data.map(({[key]: value, date}) => ({key, date, value})));

const x = d3.scaleUtc()
    .domain([data[0].date, data[data.length - 1].date])
    .range([margin.left, mwidth - margin.right]);

const y = d3.scaleLinear()
    .domain([0, d3.max(series, s => d3.max(s, d => d.value))])
    .range([mheight - margin.bottom, margin.top]);

const z = d3.scaleOrdinal(columns.slice(1), d3.schemeCategory10);

const xAxis = g => g
    .attr("transform", `translate(0,${mheight - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(mwidth / 80).tickSizeOuter(0));

const msvg = d3.select("#multi-line").append("svg");

msvg.attr("viewBox", [0, 0, mwidth, mheight])
    .call(xAxis);

const serie = msvg.append("g")
    .selectAll("g")
    .data(series)
    .join("g");

serie.append("path")
    .attr("fill", "none")
    .attr("stroke", d => z(d[0].key))
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value)));

serie.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("text-anchor", "middle")
    .selectAll("text")
    .data(d => d)
    .join("text")
        .text(d => d.value)
        .attr("dy", "0.35em")
        .attr("x", d => x(d.date))
        .attr("y", d => y(d.value))
        .call(text => text.filter((d, i, data) => i === data.length - 1)
            .append("tspan")
                .attr("font-weight", "bold")
                .text(d => ` ${d.key}`))
    .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", labelPadding);